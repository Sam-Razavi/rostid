import type { Request, Response } from 'express';
import { stripe, STRIPE_WEBHOOK_SECRET } from '../../config/stripe';
import { prisma } from '../../config/prisma';

type CartWithVariants = {
  id: string;
  items: Array<{
    productId: string;
    quantity: number;
    variantId: string | null;
    product: { priceOre: number; stock: number; isActive: boolean };
    variant: { priceOre: number; stock: number } | null;
  }>;
};

type VariantTx = {
  productVariant: {
    update: (a: unknown) => Promise<unknown>;
  };
};

type OrderResult = { id: string };

type SubPrisma = {
  subscription: {
    findUnique: (a: unknown) => Promise<{ id: string; userId: string; productId: string; variantId: string | null; intervalDays: number; product: { name: string; priceOre: number } } | null>;
  };
};

type StripeEventPrisma = {
  stripeEvent: {
    create: (a: unknown) => Promise<unknown>;
  };
};

function metaInt(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfillSubscription(session: any) {
  const subscriptionId = session.metadata?.subscriptionId as string | undefined;
  const userId = session.metadata?.userId as string | undefined;
  if (!subscriptionId || !userId) return;

  const sub = await (prisma as unknown as SubPrisma).subscription.findUnique({
    where: { id: subscriptionId },
    include: { product: { select: { name: true, priceOre: true } } },
  });
  if (!sub) return;

  const amountPaid = session.amount_total as number ?? Math.round(sub.product.priceOre * 0.9);
  const subtotalOre = sub.product.priceOre;

  await (prisma.order.create as unknown as (a: unknown) => Promise<OrderResult>)({
    data: {
      userId,
      subtotalOre,
      discountOre: Math.max(0, subtotalOre - amountPaid),
      totalOre: amountPaid,
      status: 'processing',
      ...(session.id ? { stripeSessionId: session.id } : {}),
      items: {
        create: [{
          productId: sub.productId,
          variantId: sub.variantId ?? undefined,
          quantity: 1,
          unitPriceOre: amountPaid,
        }],
      },
    },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfillOrder(session: any) {
  const userId = session.metadata?.userId as string | undefined;
  const cartId = session.metadata?.cartId as string | undefined;
  const loyaltyPointsStr = session.metadata?.loyaltyPoints as string | undefined;
  const giftCardCode = session.metadata?.giftCardCode as string | undefined;
  const discountCode = session.metadata?.discountCode as string | undefined;
  const shippingRateId = session.metadata?.shippingRateId as string | undefined;
  const shippingAddressId = session.metadata?.shippingAddressId as string | undefined;
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

  const calculatedSubtotalOre = cart.items.reduce(
    (sum, item) => sum + (item.variant?.priceOre ?? item.product.priceOre) * item.quantity,
    0
  );
  const subtotalOre = metaInt(session.metadata?.subtotalOre, calculatedSubtotalOre);
  const shippingOre = metaInt(session.metadata?.shippingOre);
  const discountOre = metaInt(session.metadata?.discountOre);
  const loyaltyDiscountOre = metaInt(session.metadata?.loyaltyDiscountOre);
  const giftCardOre = metaInt(session.metadata?.giftCardOre);
  const totalOre = metaInt(session.amount_total, Math.max(0, subtotalOre + shippingOre - discountOre - loyaltyDiscountOre - giftCardOre));

  let createdOrderId: string | null = null;

  await prisma.$transaction(async (tx) => {
    for (const item of cart.items) {
      if (!item.product.isActive) return;
      const stock = item.variant?.stock ?? item.product.stock;
      if (item.quantity > stock) return;
    }

    const order = await (tx.order.create as unknown as (a: unknown) => Promise<OrderResult>)({
      data: {
        userId,
        subtotalOre,
        discountOre,
        loyaltyDiscountOre,
        giftCardOre,
        totalOre,
        shippingOre,
        ...(shippingRateId ? { shippingRateId } : {}),
        ...(shippingAddressId ? { shippingAddressId } : {}),
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

    createdOrderId = order.id;

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

  if (loyaltyPointsStr && createdOrderId) {
    const pts = parseInt(loyaltyPointsStr, 10);
    if (pts >= 100) {
      const { redeemPoints } = await import('../loyalty/loyalty.service');
      await redeemPoints(userId, pts, createdOrderId).catch(console.error);
    }
  }

  if (giftCardCode) {
    const { useGiftCard } = await import('../giftcards/giftcards.service');
    await useGiftCard(giftCardCode, giftCardOre).catch(console.error);
  }

  if (discountCode) {
    const { incrementUsedCount } = await import('../discounts/discounts.service');
    await incrementUsedCount(discountCode).catch(console.error);
  }
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
    try {
      await (prisma as unknown as StripeEventPrisma).stripeEvent.create({
        data: { id: event.id, type: event.type },
      });
    } catch {
      res.json({ received: true, duplicate: true });
      return;
    }

    const sess = event.data.object;
    if (sess.metadata?.subscriptionId) {
      await fulfillSubscription(sess);
    } else {
      await fulfillOrder(sess);
    }
  }

  res.json({ received: true });
}
