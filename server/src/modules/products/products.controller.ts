import { Request, Response } from 'express';
import { listProductsSchema } from './products.schema';
import { listProducts, getProductBySlug } from './products.service';

export async function list(req: Request, res: Response): Promise<void> {
  const { query } = listProductsSchema.parse({ query: req.query });
  const result = await listProducts(query);
  res.json({ data: result, message: 'Products retrieved' });
}

export async function detail(req: Request, res: Response): Promise<void> {
  const product = await getProductBySlug(req.params.slug);
  res.json({ data: product, message: 'Product retrieved' });
}
