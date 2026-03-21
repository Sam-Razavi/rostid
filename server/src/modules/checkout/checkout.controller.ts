import type { Request, Response } from 'express';
import { createCheckoutSession } from './checkout.service';
import { env } from '../../config/env';

export async function createSession(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const successUrl = `${env.CLIENT_URL}/checkout/success`;
  const cancelUrl = `${env.CLIENT_URL}/checkout/cancel`;

  const result = await createCheckoutSession(userId, successUrl, cancelUrl);
  res.json({ data: result, message: 'Checkout session created' });
}
