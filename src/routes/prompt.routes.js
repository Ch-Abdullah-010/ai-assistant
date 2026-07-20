import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { listPrompts, createPrompt, updatePrompt, deletePrompt } from '../controllers/prompt.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listPrompts);

router.post(
  '/',
  [
    body('title').isString().notEmpty().withMessage('Title is required'),
    body('content').isString().notEmpty().withMessage('Content is required'),
    body('category').optional().isString(),
    validate,
  ],
  createPrompt
);

router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid prompt ID'),
    body('title').optional().isString(),
    body('content').optional().isString(),
    body('category').optional().isString(),
    validate,
  ],
  updatePrompt
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid prompt ID'), validate],
  deletePrompt
);

export default router;
