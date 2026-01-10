import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import type { ListProductsQuery } from './products.schema';

export async function listProducts(query: ListProductsQuery) {
  const { category, roast, minPrice, maxPrice, page, limit, sort } = query;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category && { category: { slug: category } }),
    ...(roast && { roastLevel: roast }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      priceOre: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'price_asc'
      ? { priceOre: 'asc' }
      : sort === 'price_desc'
        ? { priceOre: 'desc' }
        : sort === 'name_asc'
          ? { name: 'asc' }
          : { createdAt: 'desc' };

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  if (!product || !product.isActive) {
    throw AppError.notFound('Product not found');
  }

  return product;
}
