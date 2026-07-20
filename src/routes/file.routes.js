import { Router } from 'express';
import { param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { uploadLimiter } from '../middleware/security.middleware.js';
import {
  uploadFile,
  uploadMultiple,
  getChatFiles,
  getFile,
  downloadFile,
  deleteFile,
  serveFile,
} from '../controllers/file.controller.js';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadLimiter, uploadFile);

router.post('/upload-multiple', uploadLimiter, uploadMultiple);

router.get(
  '/chat/:id',
  [param('id').isUUID().withMessage('Invalid chat ID'), validate],
  getChatFiles
);

router.get(
  '/:fileId',
  [param('fileId').isUUID().withMessage('Invalid file ID'), validate],
  getFile
);

router.get(
  '/:fileId/download',
  [param('fileId').isUUID().withMessage('Invalid file ID'), validate],
  downloadFile
);

router.get(
  '/:fileId/serve',
  [param('fileId').isUUID().withMessage('Invalid file ID'), validate],
  serveFile
);

router.delete(
  '/:fileId',
  [param('fileId').isUUID().withMessage('Invalid file ID'), validate],
  deleteFile
);

export default router;
