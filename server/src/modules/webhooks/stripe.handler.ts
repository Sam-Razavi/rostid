import type { Request, Response } from 'express';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../../config/stripe';
import { prisma } from '../../config/prisma';

type CartWithVariants = {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    variantId: string | null;
    product: { priceOre: number };
    variant: { priceOre: number; stock: number } | null;
  }>;
};

type VariantTx = {
  productVariant: {
    update: (a: unknown) => Promise<unknown>;
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfillOrder(session: any) {
  const userId = session.metadata?.userId;
  const cartId = session.metadata?.cartId;
  if (!userId || !cartId) return;

  const cart = await (prisma.cart.findUnique as unknown as (a: unknown) => Promise<CartWithVariants | null>)({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: { select: { priceOre: true, stock: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) return;

  const totalOre = cart.items.reduce(
    (sum, item) => sum + (item.variant?.priceOre ?? item.product.priceOre) * item.quantity,
    0
  );

  await prisma.$transaction(async (tx) => {
    await (tx.order.create as unknown as (a: unknown) => Promise<unknown>)({
      data: {
        userId,
        totalOre,
        status: 'processing',
        ...(session.id ? { stripeSessionId: session.id } : {}),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
            unitPriceOre: item.variant?.priceOre ?? item.product.priceOre,
          })),
        },
      },
    });

    for (const item of cart.items) {
      if (item.variantId) {
        await (tx as unknown as VariantTx).productVariant.update({
          where: { id: item.variantId },
          data: { stock: { decrement: item.quantity } },
        });
      } else {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
  });
}

export async function stripeWebhook(req: Request, res: Response): Promise<void> {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ error: 'Stripe not configured' });
    return;
  }

  const sig = req.headers['stripe-signature'] as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, STRIPE_WEBHOOK_SECRET);
  } catch {
    res.status(400).json({ error: 'Invalid signature' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    await fulfillOrder(event.data.object);
  }

  res.json({ received: true });
}
