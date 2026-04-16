import { prisma } from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { sendOrderStatusUpdate } from '../../utils/emails/orderStatusUpdate';
import { sendEmail } from '../../utils/email';
import type { CreateProductInput, UpdateProductInput, UpdateOrderStatusInput } from './admin.schema';

const LOW_STOCK_THRESHOLD = 5;

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

export async function adminListOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, slug: true, imageUrl: true } },
        },
      },
    },
  });
}

export async function adminUpdateOrderStatus(id: string, data: UpdateOrderStatusInput) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw AppError.notFound('Order not found');

  const updated = await prisma.order.update({
    where: { id },
    data: { status: data.status },
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

  return updated;
}

export async function adminGetStats() {
  const [
    totalOrders,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    ordersByStatus,
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
  ]);

  return {
    totalOrders,
    totalRevenueOre: totalRevenue._sum.totalOre ?? 0,
    totalProducts,
    totalCustomers: totalUsers,
    recentOrders,
    ordersByStatus,
  };
}
