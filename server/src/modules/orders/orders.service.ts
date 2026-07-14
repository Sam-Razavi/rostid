import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { sendOrderConfirmation } from '../../utils/emails/orderConfirmation';

const orderInclude = {
  shippingAddress: true,
  items: {
    include: {
      product: {
        select: { id: true, name: true, slug: true, imageUrl: true },
      },
      variant: {
        select: { id: true, name: true, grind: true },
      },
    },
  },
};

type OrderWithItemsForEmail = {
  id: string;
  totalOre: number;
  items: Array<{
    quantity: number;
    unitPriceOre: number;
    product: { name: string };
  }>;
};

export async function placeOrder(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: true,
          variant: { select: { id: true, priceOre: true, stock: true } },
        },
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
    const stock = item.variant?.stock ?? item.product.stock;
    if (item.quantity > stock) {
      throw AppError.badRequest(`Not enough stock for ${item.product.name}`);
    }
  }

  const totalOre = cart.items.reduce(
    (sum, item) => sum + (item.variant?.priceOre ?? item.product.priceOre) * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await (
      tx.order.create as unknown as (args: unknown) => Promise<OrderWithItemsForEmail>
    )({
      data: {
        userId,
        subtotalOre: totalOre,
        totalOre,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId ?? undefined,
            quantity: item.quantity,
            unitPriceOre: item.variant?.priceOre ?? item.product.priceOre,
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
  const userInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
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

export async function listOrders(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: orderInclude,
      skip,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: orderInclude,
  });

  if (!order) throw AppError.notFound('Order not found');

  return order;
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId } });

  if (!order) throw AppError.notFound('Order not found');

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    throw AppError.badRequest('Only pending or confirmed orders can be cancelled');
  }

  return prisma.$transaction(async (tx) => {
    const items = await tx.orderItem.findMany({ where: { orderId } });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: orderInclude,
    });
  });
}
