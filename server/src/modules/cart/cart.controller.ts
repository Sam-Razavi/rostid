import { Request, Response } from 'express';
import { addItemSchema, updateItemSchema } from './cart.schema';
import { getCart, addItem, updateItem, removeItem } from './cart.service';

export async function getCartHandler(req: Request, res: Response): Promise<void> {
  const cart = await getCart(req.user!.userId);
  res.json({ data: cart, message: 'Cart retrieved' });
}

export async function addItemHandler(req: Request, res: Response): Promise<void> {
  const { body } = addItemSchema.parse({ body: req.body });
  const cart = await addItem(req.user!.userId, body);
  res.json({ data: cart, message: 'Item added to cart' });
}

export async function updateItemHandler(req: Request, res: Response): Promise<void> {
  const { body } = updateItemSchema.parse({ body: req.body });
  const cart = await updateItem(req.user!.userId, req.params.id, body);
  res.json({ data: cart, message: 'Cart item updated' });
}

export async function removeItemHandler(req: Request, res: Response): Promise<void> {
  const cart = await removeItem(req.user!.userId, req.params.id);
  res.json({ data: cart, message: 'Item removed from cart' });
}
