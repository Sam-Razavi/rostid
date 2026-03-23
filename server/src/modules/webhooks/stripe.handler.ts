import type { Request, Response } from 'express';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../../config/stripe';
import { prisma } from '../../config/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfillOrder(session: any) {
  const userId = session.metadata?.userId;
  const cartId = session.metadata?.cartId;
  if (!userId || !cartId) return;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: true } } },
  });

  if (!cart || cart.items.length === 0) return;

  const totalOre = cart.items.reduce(
    (sum, item) => sum + item.product.priceOre * item.quantity,
    0
  );

  await prisma.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        userId,
        totalOre,
        status: 'processing',
        // stripeSessionId added in migration 20260323000000 — will be populated after prisma generate
        ...(session.id ? { stripeSessionId: session.id } : {}),
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceOre: item.product.priceOre,
          })),
        },
      },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
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
