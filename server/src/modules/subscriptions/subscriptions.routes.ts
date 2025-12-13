import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { asyncHandler } from '../../utils/asyncHandler';
import {
  createSubscriptionHandler,
  listSubscriptionsHandler,
  updateSubscriptionHandler,
} from './subscriptions.controller';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(createSubscriptionHandler));
router.get('/', asyncHandler(listSubscriptionsHandler));
router.patch('/:id', asyncHandler(updateSubscriptionHandler));

export default router;
