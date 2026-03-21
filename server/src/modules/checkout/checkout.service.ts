import { stripe } from '../../config/stripe';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

export async function createCheckoutSession(userId: string, successUrl: string, cancelUrl: string) {
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

  const lineItems = cart.items.map((item) => ({
    price_data: {
      currency: 'sek',
      product_data: { name: item.product.name },
      unit_amount: item.product.priceOre,
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    metadata: { userId, cartId: cart.id },
  });

  return { url: session.url };
}
