import type { Request, Response } from 'express';
import { createCheckoutSession } from './checkout.service';
import { env } from '../../config/env';

export async function createSession(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const successUrl = `${env.CLIENT_URL}/checkout/success`;
  const cancelUrl = `${env.CLIENT_URL}/checkout/cancel`;
  const body = req.body as { discountCode?: string; shippingRateId?: string; loyaltyPoints?: number };
  const discountCode = body?.discountCode;
  const shippingRateId = body?.shippingRateId;
  const loyaltyPoints = body?.loyaltyPoints;

  const result = await createCheckoutSession(userId, successUrl, cancelUrl, discountCode, shippingRateId, loyaltyPoints);
  res.json({ data: result, message: 'Checkout session created' });
}
