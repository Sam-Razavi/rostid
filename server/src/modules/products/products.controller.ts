import crypto from 'crypto';
import { Request, Response } from 'express';
import { listProductsSchema } from './products.schema';
import { listProducts, getProductBySlug } from './products.service';

function makeETag(data: unknown): string {
  return `"${crypto.createHash('md5').update(JSON.stringify(data)).digest('hex').slice(0, 16)}"`;
}

export async function list(req: Request, res: Response): Promise<void> {
  const { query } = listProductsSchema.parse({ query: req.query });
  const result = await listProducts(query);
  const etag = makeETag(result);
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.setHeader('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }
  res.json({ data: result, message: 'Products retrieved' });
}

export async function detail(req: Request, res: Response): Promise<void> {
  const product = await getProductBySlug(req.params.slug);
  const etag = makeETag(product);
  res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
  res.setHeader('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }
  res.json({ data: product, message: 'Product retrieved' });
}
