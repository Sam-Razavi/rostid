import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { beforeAll, afterAll, beforeEach } from 'vitest';

export const prisma = new PrismaClient();

export let testAdminId: string;
export let testCustomerId: string;
export let testCategoryId: string;
export let testProductId: string;
export let testProductSlug: string;

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  const db = prisma as unknown as {
    stripeEvent: { deleteMany: () => Promise<unknown> };
    returnItem: { deleteMany: () => Promise<unknown> };
    return: { deleteMany: () => Promise<unknown> };
    loyaltyTransaction: { deleteMany: () => Promise<unknown> };
    loyaltyAccount: { deleteMany: () => Promise<unknown> };
    giftCard: { deleteMany: () => Promise<unknown> };
    discountCode: { deleteMany: () => Promise<unknown> };
    shippingAddress: { deleteMany: () => Promise<unknown> };
    subscription: { deleteMany: () => Promise<unknown> };
  };

  // Clean in dependency order
  await db.stripeEvent.deleteMany();
  await db.returnItem.deleteMany();
  await db.return.deleteMany();
  await db.loyaltyTransaction.deleteMany();
  await db.loyaltyAccount.deleteMany();
  await db.subscription.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await db.shippingAddress.deleteMany();
  await db.giftCard.deleteMany();
  await db.discountCode.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Seed minimal test data
  const category = await prisma.category.create({
    data: { name: 'Test Category', slug: 'test-category', description: 'Test' },
  });
  testCategoryId = category.id;

  const product = await prisma.product.create({
    data: {
      name: 'Test Coffee',
      slug: 'test-coffee',
      description: 'A test coffee',
      priceOre: 12900,
      stock: 50,
      categoryId: category.id,
    },
  });
  testProductId = product.id;
  testProductSlug = product.slug;

  const hash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@test.com', name: 'Admin', passwordHash: hash, role: 'admin' as const },
  });
  testAdminId = admin.id;

  const customer = await prisma.user.create({
    data: { email: 'customer@test.com', name: 'Customer', passwordHash: hash, role: 'customer' as const },
  });
  testCustomerId = customer.id;
});
