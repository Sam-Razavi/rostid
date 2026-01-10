import { Request, Response } from 'express';
import { getAllCategories } from './categories.service';

export async function listCategories(_req: Request, res: Response): Promise<void> {
  const categories = await getAllCategories();
  res.json({ data: categories, message: 'Categories retrieved' });
}
