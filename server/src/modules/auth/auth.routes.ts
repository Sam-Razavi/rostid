import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { register, login } from './auth.controller';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));

export default router;
