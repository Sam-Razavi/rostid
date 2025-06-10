import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { sendOrderStatusUpdate } from '../../utils/emails/orderStatusUpdate';
import { sendShippingConfirmation } from '../../utils/emails/shippingConfirmation';
import { sendEmail } from '../../utils/email';
import type { CreateProductInput, UpdateProductInput, UpdateOrderStatusInput, CreateVariantInput, UpdateVariantInput, BulkProductActionInput } from './admin.schema';

type VariantPrisma = {
  productVariant: {
    findMany: (a: unknown) => Promise<unknown[]>;
    findFirst: (a: unknown) => Promise<unknown | null>;
    create: (a: unknown) => Promise<unknown>;
    update: (a: unknown) => Promise<unknown>;
    delete: (a: unknown) => Promise<unknown>;
  };
};
const variantDb = prisma as unknown as VariantPrisma;

type AdminSubRecord = { id: string; userId: string; productId: string; intervalDays: number; status: string; nextBillingDate: Date; createdAt: Date; user: { name: string; email: string }; product: { name: string; priceOre: number } };
type AdminSubPrisma = {
  subscription: {
    findMany: (a: unknown) => Promise<AdminSubRecord[]>;
    count: (a: unknown) => Promise<number>;
  };
};
const adminSubDb = prisma as unknown as AdminSubPrisma;

const LOW_STOCK_THRESHOLD = 5;

export async function adminListVariants(productId: string) {
  return variantDb.productVariant.findMany({ where: { productId }, orderBy: { createdAt: 'asc' } } as unknown as never);
}

export async function adminCreateVariant(productId: string, data: CreateVariantInput) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw AppError.notFound('Product not found');
  return variantDb.productVariant.create({ data: { ...data, productId } } as unknown as never);
}

export async function adminUpdateVariant(productId: string, variantId: string, data: UpdateVariantInput) {
  const variant = await variantDb.productVariant.findFirst({ where: { id: variantId, productId } } as unknown as never);
  if (!variant) throw AppError.notFound('Variant not found');
  return variantDb.productVariant.update({ where: { id: variantId }, data } as unknown as never);
}

export async function adminDeleteVariant(productId: string, variantId: string) {
  const variant = await variantDb.productVariant.findFirst({ where: { id: variantId, productId } } as unknown as never);
  if (!variant) throw AppError.notFound('Variant not found');
  return variantDb.productVariant.delete({ where: { id: variantId } } as unknown as never);
}

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

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  if (
    adminEmail &&
    data.stock !== undefined &&
    updated.stock > 0 &&
    updated.stock <= LOW_STOCK_THRESHOLD
  ) {
    sendEmail({
      to: adminEmail,
      subject: `Low stock alert: ${updated.name}`,
      html: `<p><strong>${updated.name}</strong> is running low — only <strong>${updated.stock}</strong> units remaining.</p>`,
    }).catch((err) => console.error('[email] low stock alert failed:', err));
  }

  return updated;
}

export async function adminDeleteProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw AppError.notFound('Product not found');

  return prisma.product.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function adminListOrders(from?: string, to?: string) {
  const where = (from || to) ? {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  } : undefined;

  return (prisma.order.findMany as unknown as (args: unknown) => Promise<unknown[]>)({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
          variant: { select: { id: true, name: true, grind: true } },
        },
      },
    },
  });
}

export async function adminGetOrder(id: string) {
  const order = await (prisma.order.findUnique as unknown as (args: unknown) => Promise<unknown | null>)({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
      shippingAddress: true,
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
          variant: { select: { id: true, name: true, grind: true } },
        },
      },
      returns: { include: { items: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!order) throw AppError.notFound('Order not found');
  return order;
}

export async function adminUpdateOrderStatus(id: string, data: UpdateOrderStatusInput) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw AppError.notFound('Order not found');

  const updateData = {
    status: data.status,
    ...(data.trackingNumber !== undefined ? { trackingNumber: data.trackingNumber } : {}),
    ...(data.carrier !== undefined ? { carrier: data.carrier } : {}),
    ...(data.status === 'delivered' ? { fulfilledAt: new Date() } : {}),
  };

  const updated = await (prisma.order.update as unknown as (args: unknown) => Promise<{
    id: string;
    status: string;
    totalOre: number;
    user: { id: string; email: string; name: string };
    items: Array<{ product: { name: string }; quantity: number; unitPriceOre: number }>;
  }>)({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, imageUrl: true } },
        },
      },
    },
  });

  // Fire-and-forget status change email
  sendOrderStatusUpdate(updated.user.email, updated.user.name, id, data.status)
    .catch((err) => console.error('[email] order status update failed:', err));

  // Send shipping confirmation when tracking number is added
  if (data.trackingNumber) {
    sendShippingConfirmation(updated.user.email, updated.user.name, id, data.trackingNumber, data.carrier ?? null)
      .catch((err) => console.error('[email] shipping confirmation failed:', err));
  }

  // Award loyalty points when order is delivered
  if (data.status === 'delivered') {
    import('../loyalty/loyalty.service').then(({ earnPoints }) => {
      earnPoints(updated.user.id, id, updated.totalOre)
        .catch((err) => console.error('[loyalty] earn points failed:', err));
    });
  }

  return updated;
}

export async function adminListCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: 'customer' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: { select: { orders: true } },
      orders: { select: { totalOre: true } },
    },
  });

  return customers.map((c) => ({
    id: c.id,
    email: c.email,
    name: c.name,
    createdAt: c.createdAt,
    orderCount: c._count.orders,
    totalSpendOre: c.orders.reduce((sum, o) => sum + o.totalOre, 0),
  }));
}

export async function adminListSubscriptions() {
  return adminSubDb.subscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { name: true, priceOre: true } },
    },
  });
}

export async function adminGetStats() {
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    ordersByStatus,
    topProductItems,
    activeSubCount,
    activeSubs,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalOre: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { unitPriceOre: true, quantity: true },
      orderBy: { _sum: { unitPriceOre: 'desc' } },
      take: 6,
    }),
    adminSubDb.subscription.count({ where: { status: 'active' } }),
    adminSubDb.subscription.findMany({
      where: { status: 'active' },
      include: { product: { select: { priceOre: true } } },
    }),
  ]);

  const productIds = topProductItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));

  const revenueByProduct = topProductItems.map((item) => ({
    name: productMap.get(item.productId) ?? 'Unknown',
    revenueOre: item._sum.unitPriceOre ?? 0,
  }));

  // MRR = sum of monthly equivalent of each active subscription (30 days = 1 month)
  const mrrOre = activeSubs.reduce((sum: number, sub: AdminSubRecord) => {
    const monthlyMultiplier = 30 / sub.intervalDays;
    return sum + Math.round(sub.product.priceOre * 0.9 * monthlyMultiplier);
  }, 0);

  return {
    totalOrders,
    totalRevenueOre: totalRevenue._sum.totalOre ?? 0,
    totalProducts,
    totalCustomers: totalUsers,
    recentOrders,
    ordersByStatus,
    revenueByProduct,
    activeSubscriptions: activeSubCount,
    mrrOre,
  };
}
