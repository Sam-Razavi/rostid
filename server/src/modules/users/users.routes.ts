import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { updateProfileHandler, changePasswordHandler, deleteAccountHandler } from './users.controller';

const router = Router();

router.use(authenticate);

router.patch('/me', asyncHandler(updateProfileHandler));
router.patch('/me/password', asyncHandler(changePasswordHandler));
router.delete('/me', asyncHandler(deleteAccountHandler));

export default router;
