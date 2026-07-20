import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authLimiter, signupLimiter } from '../middleware/security.middleware.js';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getSession,
  updatePassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/signup',
  signupLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate,
  ],
  signUp
);

router.post(
  '/signin',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  signIn
);

router.post('/signout', authenticate, signOut);

router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate,
  ],
  resetPassword
);

router.get('/session', authenticate, getSession);

router.put(
  '/password',
  authenticate,
  [
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  updatePassword
);

export default router;
