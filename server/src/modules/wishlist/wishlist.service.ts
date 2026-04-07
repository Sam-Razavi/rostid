import { prisma } from '../../config/prisma';

type WishlistPrisma = {
  wishlistItem: {
    findMany: (a: unknown) => Promise<unknown[]>;
    create: (a: unknown) => Promise<unknown>;
    deleteMany: (a: unknown) => Promise<unknown>;
    findFirst: (a: unknown) => Promise<unknown>;
  };
};

const db = prisma as unknown as WishlistPrisma;

const productSelect = {
  id: true,
  name: true,
  slug: true,
  priceOre: true,
  imageUrl: true,
  stock: true,
  isActive: true,
};

export async function getWishlist(userId: string) {
  return db.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: productSelect } },
  });
}

export async function addToWishlist(userId: string, productId: string) {
  const existing = await db.wishlistItem.findFirst({ where: { userId, productId } });
  if (existing) return existing;

  return db.wishlistItem.create({
    data: { userId, productId },
    include: { product: { select: productSelect } },
  });
}

export async function removeFromWishlist(userId: string, productId: string) {
  await db.wishlistItem.deleteMany({ where: { userId, productId } });
}
