import { stripe } from '../../config/stripe';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { validateDiscount, incrementUsedCount } from '../discounts/discounts.service';

type ShippingRatePrisma = {
  shippingRate: {
    findUnique: (a: unknown) => Promise<{ id: string; name: string; priceOre: number; freeThresholdOre: number | null } | null>;
  };
};

export async function createCheckoutSession(
  userId: string,
  successUrl: string,
  cancelUrl: string,
  discountCode?: string | null,
  shippingRateId?: string | null,
  loyaltyPoints?: number | null,
  giftCardCode?: string | null
) {
  if (!stripe) throw AppError.badRequest('Payments are not configured on this server');

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, priceOre: true, stock: true, isActive: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw AppError.badRequest('Your cart is empty');
  }

  const subtotalOre = cart.items.reduce((sum, i) => sum + i.product.priceOre * i.quantity, 0);

  const lineItems: {
    price_data: { currency: string; product_data: { name: string }; unit_amount: number };
    quantity: number;
  }[] = cart.items.map((item) => ({
    price_data: {
      currency: 'sek',
      product_data: { name: item.product.name },
      unit_amount: item.product.priceOre,
    },
    quantity: item.quantity,
  }));

  // Shipping
  let shippingOre = 0;
  let shippingRateName = '';
  if (shippingRateId) {
    const rate = await (prisma as unknown as ShippingRatePrisma).shippingRate.findUnique({ where: { id: shippingRateId } });
    if (rate) {
      const effectivePrice = rate.freeThresholdOre && subtotalOre >= rate.freeThresholdOre ? 0 : rate.priceOre;
      shippingOre = effectivePrice;
      shippingRateName = rate.name;
      if (shippingOre > 0) {
        lineItems.push({
          price_data: { currency: 'sek', product_data: { name: `Shipping (${shippingRateName})` }, unit_amount: shippingOre },
          quantity: 1,
        });
      }
    }
  }

  // Loyalty points redemption
  let loyaltyDiscountOre = 0;
  if (loyaltyPoints && loyaltyPoints >= 100) {
    loyaltyDiscountOre = Math.floor(loyaltyPoints / 100) * 1000;
    lineItems.push({
      price_data: { currency: 'sek', product_data: { name: `Loyalty points (${loyaltyPoints} pts)` }, unit_amount: -loyaltyDiscountOre },
      quantity: 1,
    });
  }

  // Gift card redemption
  let appliedGiftCard: string | undefined;
  if (giftCardCode) {
    try {
      const { validateGiftCard } = await import('../giftcards/giftcards.service');
      const gc = await validateGiftCard(giftCardCode);
      const deductOre = Math.min(gc.availableOre, subtotalOre + shippingOre - loyaltyDiscountOre);
      if (deductOre > 0) {
        lineItems.push({
          price_data: { currency: 'sek', product_data: { name: `Gift card (${gc.code})` }, unit_amount: -deductOre },
          quantity: 1,
        });
        appliedGiftCard = gc.code;
      }
    } catch {
      // Invalid gift card — proceed without
    }
  }

  let appliedCode: string | undefined;
  if (discountCode) {
    try {
      const discount = await validateDiscount(discountCode, subtotalOre);
      lineItems.push({
        price_data: {
          currency: 'sek',
          product_data: { name: `Discount (${discount.code})` },
          unit_amount: -discount.discountOre,
        },
        quantity: 1,
      });
      appliedCode = discount.code;
    } catch {
      // Invalid discount code — proceed without discount
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId, cartId: cart.id,
      ...(appliedCode ? { discountCode: appliedCode } : {}),
      ...(shippingRateId ? { shippingRateId } : {}),
      ...(loyaltyPoints && loyaltyPoints > 0 ? { loyaltyPoints: String(loyaltyPoints) } : {}),
      ...(appliedGiftCard ? { giftCardCode: appliedGiftCard } : {}),
    },
  });

  if (appliedCode) {
    await incrementUsedCount(appliedCode).catch(() => undefined);
  }

  return { url: session.url };
}
