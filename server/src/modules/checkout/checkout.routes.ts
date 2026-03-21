import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { createSession } from './checkout.controller';

const router = Router();

router.post('/session', authenticate, asyncHandler(createSession));

export default router;
