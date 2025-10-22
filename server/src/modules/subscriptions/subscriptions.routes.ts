import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../utils/asyncHandler';
import { env } from '../../config/env';
import {
  createSubscriptionHandler,
  listSubscriptionsHandler,
  updateSubscriptionHandler,
  processDueHandler,
} from './subscriptions.controller';

const router = Router();

function requireCronSecret(req: Request, res: Response, next: NextFunction) {
  if (env.CRON_SECRET && req.headers['x-cron-secret'] !== env.CRON_SECRET) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid cron secret' });
    return;
  }
  next();
}

router.get('/process-due', requireCronSecret, asyncHandler(processDueHandler));

router.use(authenticate);

router.post('/', asyncHandler(createSubscriptionHandler));
router.get('/', asyncHandler(listSubscriptionsHandler));
router.patch('/:id', asyncHandler(updateSubscriptionHandler));

export default router;
