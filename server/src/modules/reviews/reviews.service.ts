import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import type { CreateReviewInput } from './reviews.schema';

export async function listReviews(productSlug: string) {
  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product) throw AppError.notFound('Product not found');

  const reviews = await prisma.review.findMany({
    where: { productId: product.id },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return { reviews, avgRating, count: reviews.length };
}

export async function createReview(productSlug: string, userId: string, input: CreateReviewInput) {
  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product || !product.isActive) throw AppError.notFound('Product not found');

  const existing = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId: product.id } },
  });
  if (existing) throw AppError.conflict('You have already reviewed this product');

  return prisma.review.create({
    data: { userId, productId: product.id, rating: input.rating, body: input.body },
    include: { user: { select: { id: true, name: true } } },
  });
}
