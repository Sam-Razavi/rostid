import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { validateDiscountHandler } from './discounts.controller';

const router = Router();

router.post('/validate', authenticate, asyncHandler(validateDiscountHandler));

export default router;
