import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createSubscriptionHandler,
  listSubscriptionsHandler,
  updateSubscriptionHandler,
  processDueHandler,
} from './subscriptions.controller';

const router = Router();

// Cron-callable renewal endpoint (no auth required — secured by obscurity/cron secret in prod)
router.get('/process-due', asyncHandler(processDueHandler));

router.use(authenticate);

router.post('/', asyncHandler(createSubscriptionHandler));
router.get('/', asyncHandler(listSubscriptionsHandler));
router.patch('/:id', asyncHandler(updateSubscriptionHandler));

export default router;
