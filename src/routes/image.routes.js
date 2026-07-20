import { Router } from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { imageGenLimiter } from '../middleware/security.middleware.js';
import { streamImageGeneration, serveGeneratedImage } from '../controllers/image.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/generate/:id',
  imageGenLimiter,
  [
    param('id').isUUID().withMessage('Invalid chat ID'),
    body('prompt').isString().notEmpty().withMessage('Image prompt is required'),
    validate,
  ],
  streamImageGeneration
);

router.get(
  '/file/:filename',
  serveGeneratedImage
);

export default router;
