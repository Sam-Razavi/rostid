import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';

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

  return order;
}
