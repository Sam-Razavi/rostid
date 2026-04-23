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
} from './admin.service';
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
