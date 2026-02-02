import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { register, login, refresh, logout, me } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(me));

export default router;
