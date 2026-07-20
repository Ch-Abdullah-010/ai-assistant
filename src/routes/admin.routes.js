import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { adminLimiter } from '../middleware/security.middleware.js';
import {
  getStats,
  listUsers,
  getUser,
  setUserRole,
  removeUser,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);
router.use(adminLimiter);

router.get('/stats', getStats);

router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString(),
    validate,
  ],
  listUsers
);

router.get(
  '/users/:userId',
  [param('userId').isUUID().withMessage('Invalid user ID'), validate],
  getUser
);

router.patch(
  '/users/:userId/role',
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be "user" or "admin"'),
    validate,
  ],
  setUserRole
);

router.delete(
  '/users/:userId',
  [param('userId').isUUID().withMessage('Invalid user ID'), validate],
  removeUser
);

export default router;
