import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authLimiter } from '../middleware/rateLimiter';
import {
  registerValidation,
  verifyCodeValidation,
  loginValidation
} from '../middleware/validation';

const router = Router();

router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/verify', authLimiter, verifyCodeValidation, AuthController.verify);
router.post('/resend-code', authLimiter, AuthController.resendCode);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/refresh', AuthController.refresh);

export default router;
