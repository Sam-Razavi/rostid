import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { updateProfileHandler } from './users.controller';

const router = Router();

router.use(authenticate);

router.patch('/me', asyncHandler(updateProfileHandler));

export default router;
