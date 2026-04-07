import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { getWishlistHandler, addToWishlistHandler, removeFromWishlistHandler } from './wishlist.controller';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(getWishlistHandler));
router.post('/', asyncHandler(addToWishlistHandler));
router.delete('/:productId', asyncHandler(removeFromWishlistHandler));

export default router;
