import type { Request, Response } from 'express';
import { createCheckoutSession } from './checkout.service';
import { env } from '../../config/env';

export async function createSession(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const successUrl = `${env.CLIENT_URL}/checkout/success`;
  const cancelUrl = `${env.CLIENT_URL}/checkout/cancel`;
  const body = req.body as { discountCode?: string; shippingRateId?: string; shippingAddressId?: string; loyaltyPoints?: number; giftCardCode?: string; customerNote?: string };
  const discountCode = body?.discountCode;
  const shippingRateId = body?.shippingRateId;
  const shippingAddressId = body?.shippingAddressId;
  const loyaltyPoints = body?.loyaltyPoints;
  const giftCardCode = body?.giftCardCode;
  const customerNote = body?.customerNote;

  const result = await createCheckoutSession(userId, successUrl, cancelUrl, discountCode, shippingRateId, loyaltyPoints, giftCardCode, shippingAddressId, customerNote);
  res.json({ data: result, message: 'Checkout session created' });
}
