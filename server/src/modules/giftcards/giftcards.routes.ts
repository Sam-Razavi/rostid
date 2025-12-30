import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { validateGiftCard } from './giftcards.service';
import type { Request, Response } from 'express';

const router = Router();

router.post('/validate', asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body as { code: string };
  const result = await validateGiftCard(code);
  res.json({ data: result });
}));

export default router;
