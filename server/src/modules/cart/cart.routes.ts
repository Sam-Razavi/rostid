import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import {
  getCartHandler,
  addItemHandler,
  updateItemHandler,
  removeItemHandler,
} from './cart.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getCartHandler));
router.post('/items', asyncHandler(addItemHandler));
router.patch('/items/:id', asyncHandler(updateItemHandler));
router.delete('/items/:id', asyncHandler(removeItemHandler));

export default router;
