import { Request, Response } from 'express';
import { addItemSchema } from './cart.schema';
import { getCart, addItem } from './cart.service';

export async function getCartHandler(req: Request, res: Response): Promise<void> {
  const cart = await getCart(req.user!.userId);
  res.json({ data: cart, message: 'Cart retrieved' });
}

export async function addItemHandler(req: Request, res: Response): Promise<void> {
  const { body } = addItemSchema.parse({ body: req.body });
  const cart = await addItem(req.user!.userId, body);
  res.json({ data: cart, message: 'Item added to cart' });
}
