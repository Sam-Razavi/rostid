import type { Request, Response } from 'express';
import { createSubscription, listSubscriptions, updateSubscription, processDueSubscriptions } from './subscriptions.service';
import { createSubscriptionSchema, updateSubscriptionSchema } from './subscriptions.schema';

export async function createSubscriptionHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { body } = createSubscriptionSchema.parse({ body: req.body });
  const result = await createSubscription(userId, body.productId, body.intervalDays, body.variantId);
  res.status(201).json({ data: result, message: 'Subscription created' });
}

export async function listSubscriptionsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const subscriptions = await listSubscriptions(userId);
  res.json({ data: { subscriptions } });
}

export async function updateSubscriptionHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const { id } = req.params;
  const { body } = updateSubscriptionSchema.parse({ body: req.body });
  const subscription = await updateSubscription(userId, id, { status: body.status, intervalDays: body.intervalDays });
  res.json({ data: { subscription }, message: 'Subscription updated' });
}

export async function processDueHandler(_req: Request, res: Response): Promise<void> {
  const result = await processDueSubscriptions();
  res.json({ data: result, message: `Processed ${result.processed} subscriptions` });
}
