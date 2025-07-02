import { Request, Response } from 'express';
import { placeOrder, listOrders, getOrder, cancelOrder } from './orders.service';

export async function placeOrderHandler(req: Request, res: Response): Promise<void> {
  const order = await placeOrder(req.user!.userId);
  res.status(201).json({ data: order, message: 'Order placed successfully' });
}

export async function listOrdersHandler(req: Request, res: Response): Promise<void> {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 50);
  const result = await listOrders(req.user!.userId, page, limit);
  res.json({ data: result, message: 'Orders retrieved' });
}

export async function getOrderHandler(req: Request, res: Response): Promise<void> {
  const order = await getOrder(req.user!.userId, req.params.id);
  res.json({ data: order, message: 'Order retrieved' });
}

export async function cancelOrderHandler(req: Request, res: Response): Promise<void> {
  const order = await cancelOrder(req.user!.userId, req.params.id);
  res.json({ data: order, message: 'Order cancelled' });
}
