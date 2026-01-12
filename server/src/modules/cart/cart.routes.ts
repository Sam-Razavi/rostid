import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { getCartHandler, addItemHandler } from './cart.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getCartHandler));
router.post('/items', asyncHandler(addItemHandler));

export default router;
