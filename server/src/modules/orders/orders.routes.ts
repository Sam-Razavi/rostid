import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { placeOrderHandler, listOrdersHandler, getOrderHandler, cancelOrderHandler } from './orders.controller';
import { submitReturnHandler } from '../returns/returns.controller';

const router = Router();

router.use(authenticate);

router.post('/', asyncHandler(placeOrderHandler));
router.get('/', asyncHandler(listOrdersHandler));
router.get('/:id', asyncHandler(getOrderHandler));
router.patch('/:id/cancel', asyncHandler(cancelOrderHandler));
router.post('/:id/return', asyncHandler(submitReturnHandler));

export default router;
