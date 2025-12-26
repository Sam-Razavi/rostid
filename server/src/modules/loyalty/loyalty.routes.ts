import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../utils/asyncHandler';
import { getBalance, redeemPreview } from './loyalty.service';
import type { Request, Response } from 'express';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const balance = await getBalance(req.user!.userId);
  res.json({ data: balance });
}));

router.post('/redeem-preview', asyncHandler(async (req: Request, res: Response) => {
  const { points } = req.body as { points: number };
  const result = await redeemPreview(points);
  res.json({ data: result });
}));

export default router;
