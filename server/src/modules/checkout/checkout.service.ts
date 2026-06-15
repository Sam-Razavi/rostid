import { stripe } from '../../config/stripe';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { validateDiscount } from '../discounts/discounts.service';

type ShippingRatePrisma = {
  shippingRate: {
    findUnique: (a: unknown) => Promise<{ id: string; name: string; priceOre: number; freeThresholdOre: number | null } | null>;
  };
  shippingAddress: {
    findFirst: (a: unknown) => Promise<{ id: string } | null>;
  };
};

export async function createCheckoutSession(
  userId: string,
  successUrl: string,
  cancelUrl: string,
  discountCode?: string | null,
  shippingRateId?: string | null,
  loyaltyPoints?: number | null,
  giftCardCode?: string | null,
  shippingAddressId?: string | null,
  customerNote?: string | null
) {
  const cart = await (prisma.cart.findUnique as unknown as (a: unknown) => Promise<{
    id: string;
    items: Array<{
      productId: string;
      variantId: string | null;
      quantity: number;
      product: { id: string; name: string; priceOre: number; stock: number; isActive: boolean };
      variant: { id: string; name: string; priceOre: number } | null;
    }>;
  } | null>)({
    where: { userId },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, priceOre: true, stock: true, isActive: true } },
          variant: { select: { id: true, name: true, priceOre: true } },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw AppError.badRequest('Your cart is empty');
  }

  if (!stripe) throw AppError.badRequest('Payments are not configured on this server');

  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw AppError.badRequest(`${item.product.name} is no longer available`);
    }
    const availableStock = item.variant
      ? (item.variant as unknown as { stock?: number }).stock ?? item.product.stock
      : item.product.stock;
    if (item.quantity > availableStock) {
      throw AppError.badRequest(`Not enough stock for ${item.product.name}`);
    }
  }

  let verifiedShippingAddressId: string | undefined;
  if (shippingAddressId) {
    const address = await (prisma as unknown as ShippingRatePrisma).shippingAddress.findFirst({
      where: { id: shippingAddressId, userId },
      select: { id: true },
    });
    if (!address) throw AppError.badRequest('Shipping address not found');
    verifiedShippingAddressId = address.id;
  }

  const subtotalOre = cart.items.reduce(
    (sum, i) => sum + (i.variant?.priceOre ?? i.product.priceOre) * i.quantity,
    0
  );

  const lineItems: {
    price_data: { currency: string; product_data: { name: string }; unit_amount: number };
    quantity: number;
  }[] = cart.items.map((item) => {
    const unitPrice = item.variant?.priceOre ?? item.product.priceOre;
    const label = item.variant ? `${item.product.name} — ${item.variant.name}` : item.product.name;
    return {
      price_data: {
        currency: 'sek',
        product_data: { name: label },
        unit_amount: unitPrice,
      },
      quantity: item.quantity,
    };
  });

  // Shipping
  let shippingOre = 0;
  if (shippingRateId) {
    const rate = await (prisma as unknown as ShippingRatePrisma).shippingRate.findUnique({ where: { id: shippingRateId } });
    if (rate) {
      shippingOre = rate.freeThresholdOre && subtotalOre >= rate.freeThresholdOre ? 0 : rate.priceOre;
      if (shippingOre > 0) {
        lineItems.push({
          price_data: { currency: 'sek', product_data: { name: `Shipping (${rate.name})` }, unit_amount: shippingOre },
          quantity: 1,
        });
      }
    }
  }

  // Loyalty points redemption
  let loyaltyDiscountOre = 0;
  if (loyaltyPoints && loyaltyPoints >= 100) {
    const { getBalance } = await import('../loyalty/loyalty.service');
    const balance = await getBalance(userId) as { points: number };
    const redeemablePoints = Math.min(balance.points, loyaltyPoints);
    loyaltyDiscountOre = Math.floor(redeemablePoints / 100) * 1000;
  }

  // Gift card redemption
  let appliedGiftCard: string | undefined;
  let giftCardOre = 0;
  if (giftCardCode) {
    try {
      const { validateGiftCard } = await import('../giftcards/giftcards.service');
      const gc = await validateGiftCard(giftCardCode);
      giftCardOre = Math.min(gc.availableOre, subtotalOre + shippingOre - loyaltyDiscountOre);
      if (giftCardOre > 0) {
        appliedGiftCard = gc.code;
      }
    } catch {
      // Invalid gift card — proceed without
    }
  }

  let appliedCode: string | undefined;
  let discountOre = 0;
  if (discountCode) {
    try {
      const discount = await validateDiscount(discountCode, subtotalOre);
      discountOre = discount.discountOre;
      appliedCode = discount.code;
    } catch {
      // Invalid discount code — proceed without discount
    }
  }

  const combinedDiscountOre = Math.min(
    discountOre + loyaltyDiscountOre + giftCardOre,
    subtotalOre + shippingOre
  );

  const discounts = combinedDiscountOre > 0
    ? [{
        coupon: (await stripe.coupons.create({
          amount_off: combinedDiscountOre,
          currency: 'sek',
          duration: 'once',
          name: 'Rostid checkout discount',
        })).id,
      }]
    : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    discounts,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: {
      userId, cartId: cart.id,
      ...(appliedCode ? { discountCode: appliedCode } : {}),
      ...(shippingRateId ? { shippingRateId } : {}),
      ...(verifiedShippingAddressId ? { shippingAddressId: verifiedShippingAddressId } : {}),
      subtotalOre: String(subtotalOre),
      shippingOre: String(shippingOre),
      discountOre: String(discountOre),
      loyaltyDiscountOre: String(loyaltyDiscountOre),
      giftCardOre: String(giftCardOre),
      ...(loyaltyPoints && loyaltyPoints > 0 ? { loyaltyPoints: String(loyaltyPoints) } : {}),
      ...(appliedGiftCard ? { giftCardCode: appliedGiftCard } : {}),
      ...(customerNote ? { customerNote: customerNote.slice(0, 500) } : {}),
    },
  });

  return { url: session.url };
}
