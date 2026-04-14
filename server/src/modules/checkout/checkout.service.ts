import { stripe } from '../../config/stripe';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { validateDiscount, incrementUsedCount } from '../discounts/discounts.service';

export async function createCheckoutSession(
  userId: string,
  successUrl: string,
  cancelUrl: string,
  discountCode?: string | null
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
    metadata: { userId, cartId: cart.id, ...(appliedCode ? { discountCode: appliedCode } : {}) },
  });

  if (appliedCode) {
    await incrementUsedCount(appliedCode).catch(() => undefined);
  }

  return { url: session.url };
}
