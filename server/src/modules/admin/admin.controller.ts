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
} from './admin.service';

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
