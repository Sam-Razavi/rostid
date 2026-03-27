import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { sendOrderConfirmation } from '../../utils/emails/orderConfirmation';

const orderInclude = {
  items: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, imageUrl: true },
      },
    },
  },
};

export async function placeOrder(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw AppError.badRequest('Cart is empty');
  }

  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw AppError.badRequest(`${item.product.name} is no longer available`);
    }
    if (item.quantity > item.product.stock) {
      throw AppError.badRequest(`Not enough stock for ${item.product.name}`);
    }
  }

  const totalOre = cart.items.reduce(
    (sum, item) => sum + item.product.priceOre * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId,
        totalOre,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPriceOre: item.product.priceOre,
          })),
        },
      },
      include: orderInclude,
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  // Fire-and-forget confirmation email
  const userInfo = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  if (userInfo) {
    sendOrderConfirmation({
      to: userInfo.email,
      customerName: userInfo.name,
      orderId: order.id,
      items: order.items.map((i) => ({
        product: { name: i.product.name },
        quantity: i.quantity,
        unitPriceOre: i.unitPriceOre,
      })),
      totalOre: order.totalOre,
    }).catch((err) => console.error('[email] order confirmation failed:', err));
  }

  return order;
}

export async function listOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: orderInclude,
  });
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) throw AppError.notFound('Order not found');

  return order;
}
