import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import {
  getProfile,
  updateProfile,
  updateSettings,
  deleteAccount,
  clearHistory,
} from '../controllers/user.controller.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);

router.put(
  '/profile',
  [
    body('name').optional().isString().isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
    body('language').optional().isString().isLength({ max: 10 }),
    validate,
  ],
  updateProfile
);

router.put(
  '/settings',
  [
    body('theme').optional().isIn(['light', 'dark']).withMessage('Theme must be light or dark'),
    body('font_size').optional().isInt({ min: 12, max: 24 }).withMessage('Font size must be between 12 and 24'),
    body('voice_enabled').optional().isBoolean(),
    validate,
  ],
  updateSettings
);

router.delete('/account', deleteAccount);

router.delete('/history', clearHistory);

export default router;
