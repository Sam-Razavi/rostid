import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import type { CreateProductInput, UpdateProductInput, UpdateOrderStatusInput } from './admin.schema';

export async function adminListProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function adminCreateProduct(data: CreateProductInput) {
  const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
  if (existing) throw AppError.conflict('Slug already in use', 'SLUG_TAKEN');

  return prisma.product.create({
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function adminUpdateProduct(id: string, data: UpdateProductInput) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw AppError.notFound('Product not found');

  if (data.slug && data.slug !== product.slug) {
    const conflict = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (conflict) throw AppError.conflict('Slug already in use', 'SLUG_TAKEN');
  }

  return prisma.product.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
}

export async function adminDeleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw AppError.notFound('Product not found');

  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}
