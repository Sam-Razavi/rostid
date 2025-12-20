import type { Request, Response } from 'express';
import { submitReturn } from './returns.service';

export async function submitReturnHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const orderId = req.params.id;
  const { reason, items } = req.body as {
    reason: string;
    items: { orderItemId: string; quantity: number }[];
  };
  const result = await submitReturn(userId, orderId, reason, items);
  res.status(201).json({ data: result, message: 'Return request submitted' });
}
