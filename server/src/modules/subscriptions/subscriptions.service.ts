import { prisma } from '../../config/prisma';
import { stripe } from '../../config/stripe';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';

type SubRecord = { id: string; userId: string; productId: string; variantId: string | null; intervalDays: number; status: string; nextBillingDate: Date; createdAt: Date };
type SubWithProduct = SubRecord & { product: { id: string; name: string; priceOre: number; imageUrl: string | null } };

type SubPrisma = {
  subscription: {
    create: (a: unknown) => Promise<SubRecord>;
    findMany: (a: unknown) => Promise<SubWithProduct[]>;
    findFirst: (a: unknown) => Promise<SubRecord | null>;
    update: (a: unknown) => Promise<{ id: string; status: string; intervalDays: number; nextBillingDate: Date }>;
  };
};

const subDb = prisma as unknown as SubPrisma;

export async function createSubscription(
  userId: string,
  productId: string,
  intervalDays: number,
  variantId?: string | null
) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) throw AppError.badRequest('Product not found');

  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + intervalDays);

  const subscription = await subDb.subscription.create({
    data: {
      userId,
      productId,
      variantId: variantId ?? null,
      intervalDays,
      nextBillingDate,
    },
  });

  // Create immediate first Stripe Checkout session if Stripe is configured
  let checkoutUrl: string | null = null;
  if (stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'sek',
            product_data: { name: `${product.name} (Subscribe & Save)` },
            unit_amount: Math.round(product.priceOre * 0.9), // 10% discount
          },
          quantity: 1,
        },
      ],
      success_url: `${env.CLIENT_URL}/subscriptions?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/subscriptions`,
      metadata: { userId, subscriptionId: subscription.id },
    });
    checkoutUrl = session.url;
  }

  return { subscription, checkoutUrl };
}

export async function listSubscriptions(userId: string) {
  return subDb.subscription.findMany({
    where: { userId },
    include: { product: { select: { id: true, name: true, priceOre: true, imageUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateSubscription(
  userId: string,
  subscriptionId: string,
  data: { status?: string; intervalDays?: number }
) {
  const sub = await subDb.subscription.findFirst({ where: { id: subscriptionId, userId } });
  if (!sub) throw AppError.notFound('Subscription not found');

  return subDb.subscription.update({
    where: { id: subscriptionId },
    data,
  });
}
