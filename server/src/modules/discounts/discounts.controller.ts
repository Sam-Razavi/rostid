import { Request, Response } from 'express';
import { validateDiscount } from './discounts.service';

export async function validateDiscountHandler(req: Request, res: Response): Promise<void> {
  const { code, orderTotalOre } = req.body as { code?: string; orderTotalOre?: number };
  if (!code || orderTotalOre === undefined) {
    res.status(400).json({ error: 'VALIDATION_ERROR', message: 'code and orderTotalOre are required' });
    return;
  }
  const result = await validateDiscount(code, orderTotalOre);
  res.json({ data: result, message: 'Discount code is valid' });
}
