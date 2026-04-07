import { Request, Response } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from './wishlist.service';

export async function getWishlistHandler(req: Request, res: Response): Promise<void> {
  const items = await getWishlist(req.user!.userId);
  res.json({ data: items, message: 'Wishlist retrieved' });
}

export async function addToWishlistHandler(req: Request, res: Response): Promise<void> {
  const { productId } = req.body as { productId?: string };
  if (!productId) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'productId is required' });
    return;
  }
  const item = await addToWishlist(req.user!.userId, productId);
  res.status(201).json({ data: item, message: 'Added to wishlist' });
}

export async function removeFromWishlistHandler(req: Request, res: Response): Promise<void> {
  await removeFromWishlist(req.user!.userId, req.params.productId);
  res.json({ data: null, message: 'Removed from wishlist' });
}
