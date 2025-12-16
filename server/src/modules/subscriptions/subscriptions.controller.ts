import type { Request, Response } from 'express';
import { createSubscription, listSubscriptions, updateSubscription, processDueSubscriptions } from './subscriptions.service';

export async function createSubscriptionHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { productId, intervalDays, variantId } = req.body as {
    productId: string;
    intervalDays: number;
    variantId?: string | null;
  };
  const result = await createSubscription(userId, productId, intervalDays, variantId);
  res.status(201).json({ data: result, message: 'Subscription created' });
}

export async function listSubscriptionsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const subscriptions = await listSubscriptions(userId);
  res.json({ data: subscriptions });
}

export async function updateSubscriptionHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { status, intervalDays } = req.body as { status?: string; intervalDays?: number };
  const subscription = await updateSubscription(userId, id, { status, intervalDays });
  res.json({ data: subscription, message: 'Subscription updated' });
}

export async function processDueHandler(_req: Request, res: Response): Promise<void> {
  const result = await processDueSubscriptions();
  res.json({ data: result, message: `Processed ${result.processed} subscriptions` });
}
