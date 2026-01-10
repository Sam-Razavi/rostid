import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { list, detail } from './products.controller';

const router = Router();

router.get('/', asyncHandler(list));
router.get('/:slug', asyncHandler(detail));

export default router;
