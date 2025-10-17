import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateGiftCard } from './giftcards.service';
import type { Request, Response } from 'express';

const validateSchema = z.object({ code: z.string().min(1).max(32) });

const router = Router();

router.post('/validate', asyncHandler(async (req: Request, res: Response) => {
  const { code } = validateSchema.parse(req.body);
  const result = await validateGiftCard(code.toUpperCase());
  res.json({ data: result });
}));

export default router;
