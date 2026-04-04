import { Request, Response } from 'express';
import { placeOrder, listOrders, getOrder, cancelOrder } from './orders.service';

export async function placeOrderHandler(req: Request, res: Response): Promise<void> {
  const order = await placeOrder(req.user!.userId);
  res.status(201).json({ data: order, message: 'Order placed successfully' });
}

export async function listOrdersHandler(req: Request, res: Response): Promise<void> {
  const orders = await listOrders(req.user!.userId);
  res.json({ data: orders, message: 'Orders retrieved' });
}

export async function getOrderHandler(req: Request, res: Response): Promise<void> {
  const order = await getOrder(req.user!.userId, req.params.id);
  res.json({ data: order, message: 'Order retrieved' });
}

export async function cancelOrderHandler(req: Request, res: Response): Promise<void> {
  const order = await cancelOrder(req.user!.userId, req.params.id);
  res.json({ data: order, message: 'Order cancelled' });
}
