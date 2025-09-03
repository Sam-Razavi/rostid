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
  listNewsletterSubscribersHandler,
  deleteNewsletterSubscriberHandler,
  exportNewsletterCsvHandler,
  getRevenueTimeSeriesHandler,
  bulkProductActionHandler,
  updateCustomerNoteHandler,
  adjustLoyaltyHandler,
} from './admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/products', asyncHandler(listProducts));
router.post('/products', asyncHandler(createProduct));
router.post('/products/bulk', asyncHandler(bulkProductActionHandler));
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
router.get('/stats/revenue', asyncHandler(getRevenueTimeSeriesHandler));
router.get('/customers', asyncHandler(listCustomersHandler));
router.patch('/customers/:id/note', asyncHandler(updateCustomerNoteHandler));
router.post('/customers/:id/loyalty', asyncHandler(adjustLoyaltyHandler));

router.get('/subscriptions', asyncHandler(listAdminSubscriptionsHandler));

router.get('/returns', asyncHandler(listAdminReturnsHandler));
router.patch('/returns/:id', asyncHandler(updateAdminReturnHandler));

router.get('/giftcards', asyncHandler(listAdminGiftCardsHandler));
router.post('/giftcards', asyncHandler(createAdminGiftCardHandler));

router.get('/newsletter', asyncHandler(listNewsletterSubscribersHandler));
router.get('/newsletter/export', asyncHandler(exportNewsletterCsvHandler));
router.delete('/newsletter/:id', asyncHandler(deleteNewsletterSubscriberHandler));

router.get('/discounts', asyncHandler(listDiscountsHandler));
router.post('/discounts', asyncHandler(createDiscountHandler));
router.delete('/discounts/:id', asyncHandler(deleteDiscountHandler));

export default router;
