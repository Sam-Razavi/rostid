import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { subscribeHandler } from './newsletter.controller';

const router = Router();

router.post('/subscribe', asyncHandler(subscribeHandler));

export default router;
