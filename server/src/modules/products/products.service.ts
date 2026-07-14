import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import type { ListProductsQuery } from './products.schema';

export async function listProducts(query: ListProductsQuery) {
  const { category, roast, search, minPrice, maxPrice, page, limit, sort, exclude, inStock } =
    query;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(exclude && { id: { not: exclude } }),
    ...(inStock && { stock: { gt: 0 } }),
    ...(category && { category: { slug: category } }),
    ...(roast && { roastLevel: roast }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { origin: { contains: search, mode: 'insensitive' } },
        { tastingNotes: { contains: search, mode: 'insensitive' } },
      ],
    }),
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
  const product = (await (prisma.product.findUnique as unknown as (a: unknown) => Promise<unknown>)(
    {
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        variants: {
          where: { isActive: true },
          orderBy: { priceOre: 'asc' },
        },
      },
    }
  )) as (Awaited<ReturnType<typeof prisma.product.findUnique>> & { variants: unknown[] }) | null;

  if (!product || !product.isActive) {
    throw AppError.notFound('Product not found');
  }

  return product;
}
