import { Request, Response } from 'express';
import { z } from 'zod';
import { validateDiscount } from './discounts.service';

const validateSchema = z.object({
  code: z.string().min(1).max(64),
  orderTotalOre: z.number().int().min(0),
});

export async function validateDiscountHandler(req: Request, res: Response): Promise<void> {
  const { code, orderTotalOre } = validateSchema.parse(req.body);
  const result = await validateDiscount(code.trim().toUpperCase(), orderTotalOre);
  res.json({ data: result, message: 'Discount code is valid' });
}
