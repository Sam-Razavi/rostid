import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrderStatus,
  getStats,
} from './admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/products', asyncHandler(listProducts));
router.post('/products', asyncHandler(createProduct));
router.patch('/products/:id', asyncHandler(updateProduct));
router.delete('/products/:id', asyncHandler(deleteProduct));

router.get('/orders', asyncHandler(listOrders));
router.patch('/orders/:id/status', asyncHandler(updateOrderStatus));

router.get('/stats', asyncHandler(getStats));

export default router;
