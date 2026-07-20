import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { chatLimiter, streamLimiter } from '../middleware/security.middleware.js';
import {
  listChats,
  getChat,
  createChat,
  updateChat,
  deleteChat,
  togglePinChat,
  searchChats,
  sendMessage,
  listMessages,
} from '../controllers/chat.controller.js';
import { streamChatCompletion } from '../controllers/ai.controller.js';
import { searchOnly, searchAndStream } from '../controllers/search.controller.js';
import { exportChat } from '../controllers/export.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listChats);

router.get('/search', searchChats);

router.post(
  '/',
  [
    body('title').optional().isString().isLength({ max: 200 }).withMessage('Title must be under 200 characters'),
    validate,
  ],
  createChat
);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('Invalid chat ID'), validate],
  getChat
);

router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid chat ID'),
    body('title').optional().isString().isLength({ max: 200 }),
    body('pinned').optional().isBoolean(),
    validate,
  ],
  updateChat
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid chat ID'), validate],
  deleteChat
);

router.patch(
  '/:id/pin',
  [param('id').isUUID().withMessage('Invalid chat ID'), validate],
  togglePinChat
);

router.post(
  '/:id/messages',
  chatLimiter,
  [
    param('id').isUUID().withMessage('Invalid chat ID'),
    body('content').isString().notEmpty().withMessage('Message content is required'),
    body('role').optional().isIn(['user', 'assistant', 'system']).withMessage('Invalid role'),
    validate,
  ],
  sendMessage
);

router.get(
  '/:id/messages',
  [
    param('id').isUUID().withMessage('Invalid chat ID'),
    validate,
  ],
  listMessages
);

router.post(
  '/:id/stream',
  streamLimiter,
  [
    param('id').isUUID().withMessage('Invalid chat ID'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    body('file_ids').optional().isArray({ max: 10 }).withMessage('file_ids must be an array'),
    body('file_ids.*').optional().isUUID().withMessage('Invalid file ID'),
    validate,
  ],
  streamChatCompletion
);

router.get(
  '/:id/export',
  [
    param('id').isUUID().withMessage('Invalid chat ID'),
    query('format').optional().isIn(['markdown', 'json', 'txt']).withMessage('Format must be markdown, json, or txt'),
    validate,
  ],
  exportChat
);

router.get(
  '/web-search',
  [
    query('q').isString().notEmpty().withMessage('Search query is required'),
    validate,
  ],
  searchOnly
);

router.post(
  '/:id/search-stream',
  streamLimiter,
  [
    param('id').isUUID().withMessage('Invalid chat ID'),
    body('message').isString().notEmpty().withMessage('Message is required'),
    validate,
  ],
  searchAndStream
);

export default router;
