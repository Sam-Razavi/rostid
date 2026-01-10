import { prisma } from '../../config/prisma';

export async function getAllCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
}
