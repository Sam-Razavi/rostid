import type { Request, Response } from 'express';
import { createCheckoutSession } from './checkout.service';
import { env } from '../../config/env';

export async function createSession(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const successUrl = `${env.CLIENT_URL}/checkout/success`;
  const cancelUrl = `${env.CLIENT_URL}/checkout/cancel`;
  const discountCode = (req.body as { discountCode?: string })?.discountCode;

  const result = await createCheckoutSession(userId, successUrl, cancelUrl, discountCode);
  res.json({ data: result, message: 'Checkout session created' });
}
