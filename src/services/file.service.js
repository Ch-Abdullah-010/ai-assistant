import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

const ALLOWED_MIMES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown',
  'application/json',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 15 * 1024 * 1024;

export const uploadDir = UPLOADS_DIR;

await fs.mkdir(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const storedName = `${uuidv4()}${ext}`;
    cb(null, storedName);
  },
});

const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]],
};

function validateMagicBytes(fileBuffer, mimeType) {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return true;

  return signatures.some((sig) => {
    if (fileBuffer.length < sig.length) return false;
    return sig.every((byte, i) => fileBuffer[i] === byte);
  });
}

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIMES.includes(file.mimetype)) {
    return cb(new Error(`File type "${file.mimetype}" is not allowed`), false);
  }
  cb(null, true);
}

export function validateFileBuffer(fileBuffer, mimeType) {
  return validateMagicBytes(fileBuffer, mimeType);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export function isImage(mimeType) {
  return mimeType.startsWith('image/');
}

export function isTextFile(mimeType) {
  return mimeType.startsWith('text/') ||
    mimeType === 'application/json';
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function readTextContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content.slice(0, 10000);
  } catch {
    return null;
  }
}

export async function deleteStoredFile(storagePath) {
  try {
    await fs.unlink(storagePath);
  } catch {
    // File may not exist
  }
}
