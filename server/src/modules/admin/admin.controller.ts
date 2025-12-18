import { Request, Response } from 'express';
import {
  createProductSchema,
  updateProductSchema,
  updateOrderStatusSchema,
} from './admin.schema';
import {
  adminListProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminListOrders,
  adminUpdateOrderStatus,
  adminGetStats,
  adminListCustomers,
  adminListVariants,
  adminCreateVariant,
  adminUpdateVariant,
  adminDeleteVariant,
  adminListSubscriptions,
} from './admin.service';
import { createVariantSchema, updateVariantSchema } from './admin.schema';
import { listDiscounts, createDiscount, deleteDiscount } from '../discounts/discounts.service';

export async function listProducts(_req: Request, res: Response): Promise<void> {
  const products = await adminListProducts();
  res.json({ data: products, message: 'Products retrieved' });
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  const { body } = createProductSchema.parse({ body: req.body });
  const product = await adminCreateProduct(body);
  res.status(201).json({ data: product, message: 'Product created' });
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const { body } = updateProductSchema.parse({ body: req.body });
  const product = await adminUpdateProduct(req.params.id, body);
  res.json({ data: product, message: 'Product updated' });
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  await adminDeleteProduct(req.params.id);
  res.json({ data: null, message: 'Product deactivated' });
}

export async function listOrders(_req: Request, res: Response): Promise<void> {
  const orders = await adminListOrders();
  res.json({ data: orders, message: 'Orders retrieved' });
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { body } = updateOrderStatusSchema.parse({ body: req.body });
  const order = await adminUpdateOrderStatus(req.params.id, body);
  res.json({ data: order, message: 'Order status updated' });
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  const stats = await adminGetStats();
  res.json({ data: stats, message: 'Stats retrieved' });
}

export async function listCustomersHandler(_req: Request, res: Response): Promise<void> {
  const customers = await adminListCustomers();
  res.json({ data: customers, message: 'Customers retrieved' });
}

export async function exportOrdersCsvHandler(_req: Request, res: Response): Promise<void> {
  const { prisma } = await import('../../config/prisma');
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } } },
  });

  const rows = [
    ['Order ID', 'Date', 'Customer Name', 'Customer Email', 'Status', 'Total (SEK)'].join(','),
    ...orders.map((o) => [
      o.id,
      o.createdAt.toISOString(),
      `"${o.user.name.replace(/"/g, '""')}"`,
      o.user.email,
      o.status,
      (o.totalOre / 100).toFixed(2),
    ].join(',')),
  ];

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(rows.join('\n'));
}

export async function listVariantsHandler(req: Request, res: Response): Promise<void> {
  const variants = await adminListVariants(req.params.productId);
  res.json({ data: variants, message: 'Variants retrieved' });
}

export async function createVariantHandler(req: Request, res: Response): Promise<void> {
  const { body } = createVariantSchema.parse({ body: req.body });
  const variant = await adminCreateVariant(req.params.productId, body);
  res.status(201).json({ data: variant, message: 'Variant created' });
}

export async function updateVariantHandler(req: Request, res: Response): Promise<void> {
  const { body } = updateVariantSchema.parse({ body: req.body });
  const variant = await adminUpdateVariant(req.params.productId, req.params.variantId, body);
  res.json({ data: variant, message: 'Variant updated' });
}

export async function deleteVariantHandler(req: Request, res: Response): Promise<void> {
  await adminDeleteVariant(req.params.productId, req.params.variantId);
  res.json({ data: null, message: 'Variant deleted' });
}

export async function listAdminSubscriptionsHandler(_req: Request, res: Response): Promise<void> {
  const subscriptions = await adminListSubscriptions();
  res.json({ data: subscriptions, message: 'Subscriptions retrieved' });
}

export async function listDiscountsHandler(_req: Request, res: Response): Promise<void> {
  const codes = await listDiscounts();
  res.json({ data: codes, message: 'Discount codes retrieved' });
}

export async function createDiscountHandler(req: Request, res: Response): Promise<void> {
  const { code, type, value, minOrderOre, maxUses, expiresAt } = req.body as {
    code?: string; type?: string; value?: number;
    minOrderOre?: number; maxUses?: number; expiresAt?: string;
  };
  if (!code || !type || value === undefined) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'code, type, and value are required' });
    return;
  }
  if (type !== 'percentage' && type !== 'fixed') {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'type must be percentage or fixed' });
    return;
  }
  const discount = await createDiscount({ code, type, value, minOrderOre, maxUses, expiresAt });
  res.status(201).json({ data: discount, message: 'Discount code created' });
}

export async function deleteDiscountHandler(req: Request, res: Response): Promise<void> {
  await deleteDiscount(req.params.id);
  res.json({ data: null, message: 'Discount code deleted' });
}
