import type { Request, Response } from 'express';
import { submitReturn } from './returns.service';
import { submitReturnSchema } from './returns.schema';

export async function submitReturnHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const orderId = req.params.id;
  const { body } = submitReturnSchema.parse({ body: req.body });
  const result = await submitReturn(userId, orderId, body.reason, body.items);
  res.status(201).json({ data: result, message: 'Return request submitted' });
}
