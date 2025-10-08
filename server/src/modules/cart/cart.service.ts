import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import type { AddItemInput, UpdateItemInput } from './cart.schema';

type CartPrisma = {
  cartItem: {
    findUnique: (a: unknown) => Promise<unknown | null>;
    findFirst: (a: unknown) => Promise<unknown | null>;
    create: (a: unknown) => Promise<unknown>;
    update: (a: unknown) => Promise<unknown>;
  };
};
const cartDb = prisma as unknown as CartPrisma;

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
      variant: {
        select: {
          id: true,
          name: true,
          grind: true,
          priceOre: true,
          stock: true,
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
  if (!product || !product.isActive) throw AppError.notFound('Product not found');

  // Determine stock limit from variant or product
  let stockLimit = product.stock;
  if (data.variantId) {
    const variant = await (prisma as unknown as { productVariant: { findUnique: (a: unknown) => Promise<{ stock: number } | null> } })
      .productVariant.findUnique({ where: { id: data.variantId } });
    if (variant) stockLimit = variant.stock;
  }

  const cart = await getOrCreateCart(userId);

  const existing = await cartDb.cartItem.findFirst({
    where: { cartId: cart.id, productId: data.productId, variantId: data.variantId ?? null },
  }) as ({ id: string; quantity: number } | null);

  if (existing) {
    const newQty = existing.quantity + data.quantity;
    if (newQty > stockLimit) throw AppError.badRequest(`Only ${stockLimit} in stock`);
    await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: newQty } });
  } else {
    if (data.quantity > stockLimit) throw AppError.badRequest(`Only ${stockLimit} in stock`);
    await cartDb.cartItem.create({
      data: { cartId: cart.id, productId: data.productId, variantId: data.variantId ?? null, quantity: data.quantity },
    });
  }

  return getOrCreateCart(userId);
}

export async function updateItem(userId: string, itemId: string, data: UpdateItemInput) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) throw AppError.notFound('Cart not found');

  const item = await (prisma.cartItem.findFirst as unknown as (a: unknown) => Promise<{
    id: string;
    variantId: string | null;
    product: { stock: number };
    variant: { stock: number } | null;
  } | null>)({
    where: { id: itemId, cartId: cart.id },
    include: {
      product: { select: { stock: true } },
      variant: { select: { stock: true } },
    },
  });

  if (!item) throw AppError.notFound('Cart item not found');

  const stockLimit = item.variant?.stock ?? item.product.stock;
  if (data.quantity > stockLimit) {
    throw AppError.badRequest(`Only ${stockLimit} in stock`);
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
