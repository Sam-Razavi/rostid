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
  getAdminOrderHandler,
  updateOrderStatus,
  getStats,
  listDiscountsHandler,
  createDiscountHandler,
  deleteDiscountHandler,
  listCustomersHandler,
  exportOrdersCsvHandler,
  listVariantsHandler,
  createVariantHandler,
  updateVariantHandler,
  deleteVariantHandler,
  listAdminSubscriptionsHandler,
  listAdminReturnsHandler,
  updateAdminReturnHandler,
  listAdminGiftCardsHandler,
  createAdminGiftCardHandler,
} from './admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/products', asyncHandler(listProducts));
router.post('/products', asyncHandler(createProduct));
router.patch('/products/:id', asyncHandler(updateProduct));
router.delete('/products/:id', asyncHandler(deleteProduct));

router.get('/products/:productId/variants', asyncHandler(listVariantsHandler));
router.post('/products/:productId/variants', asyncHandler(createVariantHandler));
router.patch('/products/:productId/variants/:variantId', asyncHandler(updateVariantHandler));
router.delete('/products/:productId/variants/:variantId', asyncHandler(deleteVariantHandler));

router.get('/orders', asyncHandler(listOrders));
router.get('/orders/export', asyncHandler(exportOrdersCsvHandler));
router.get('/orders/:id', asyncHandler(getAdminOrderHandler));
router.patch('/orders/:id/status', asyncHandler(updateOrderStatus));

router.get('/stats', asyncHandler(getStats));
router.get('/customers', asyncHandler(listCustomersHandler));

router.get('/subscriptions', asyncHandler(listAdminSubscriptionsHandler));

router.get('/returns', asyncHandler(listAdminReturnsHandler));
router.patch('/returns/:id', asyncHandler(updateAdminReturnHandler));

router.get('/gift-cards', asyncHandler(listAdminGiftCardsHandler));
router.post('/gift-cards', asyncHandler(createAdminGiftCardHandler));

router.get('/discounts', asyncHandler(listDiscountsHandler));
router.post('/discounts', asyncHandler(createDiscountHandler));
router.delete('/discounts/:id', asyncHandler(deleteDiscountHandler));

export default router;
