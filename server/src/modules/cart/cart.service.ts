import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import type { AddItemInput, UpdateItemInput } from './cart.schema';

const cartInclude = {
  items: {
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          priceOre: true,
          imageUrl: true,
          stock: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' as const },
  },
};

async function getOrCreateCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    include: cartInclude,
  });
}

export async function getCart(userId: string) {
  return getOrCreateCart(userId);
}

export async function addItem(userId: string, data: AddItemInput) {
  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || !product.isActive) {
    throw AppError.notFound('Product not found');
  }

  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId: data.productId } },
  });

  if (existing) {
    const newQty = existing.quantity + data.quantity;
    if (newQty > product.stock) {
      throw AppError.badRequest(`Only ${product.stock} in stock`);
    }
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    if (data.quantity > product.stock) {
      throw AppError.badRequest(`Only ${product.stock} in stock`);
    }
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: data.productId,
        quantity: data.quantity,
      },
    });
  }

  return getOrCreateCart(userId);
}

export async function updateItem(userId: string, itemId: string, data: UpdateItemInput) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw AppError.notFound('Cart not found');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
    include: { product: { select: { stock: true } } },
  });

  if (!item) throw AppError.notFound('Cart item not found');

  if (data.quantity > item.product.stock) {
    throw AppError.badRequest(`Only ${item.product.stock} in stock`);
  }

  await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity: data.quantity },
  });

  return getOrCreateCart(userId);
}

export async function removeItem(userId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw AppError.notFound('Cart not found');

  const item = await prisma.cartItem.findFirst({
    where: { id: itemId, cartId: cart.id },
  });

  if (!item) throw AppError.notFound('Cart item not found');

  await prisma.cartItem.delete({ where: { id: itemId } });

  return getOrCreateCart(userId);
}
