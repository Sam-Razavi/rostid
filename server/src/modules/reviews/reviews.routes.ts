import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/authenticate';
import { getReviews, postReview } from './reviews.controller';

const router = Router({ mergeParams: true });

router.get('/', asyncHandler(getReviews));
router.post('/', authenticate, asyncHandler(postReview));

export default router;
