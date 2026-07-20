import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import * as fileRepository from '../database/repositories/file.repository.js';
import { upload, isImage, isTextFile, formatFileSize, readTextContent, deleteStoredFile, validateFileBuffer } from '../services/file.service.js';

const UPLOADS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../uploads');

export const uploadMiddleware = upload.single('file');

export async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = await fs.readFile(req.file.path);
    if (!validateFileBuffer(fileBuffer, req.file.mimetype)) {
      await deleteStoredFile(req.file.path);
      return res.status(400).json({ error: 'File content does not match its extension. Upload rejected.' });
    }

    const { chat_id } = req.body;
    if (!chat_id) {
      await deleteStoredFile(req.file.path);
      return res.status(400).json({ error: 'chat_id is required' });
    }

    const file = await fileRepository.createFile({
      chat_id,
      user_id: req.user.id,
      original_name: req.file.originalname,
      stored_name: req.file.filename,
      mime_type: req.file.mimetype,
      size: req.file.size,
      storage_path: req.file.path,
    });

    res.status(201).json({
      file: {
        ...file,
        size_formatted: formatFileSize(file.size),
        is_image: isImage(file.mime_type),
      },
    });
  } catch (error) {
    if (req.file) {
      await deleteStoredFile(req.file.path).catch(() => {});
    }
    next(error);
  }
}

export async function uploadMultiple(req, res, next) {
  try {
    const filesUpload = upload.array('files', 10);

    filesUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const { chat_id } = req.body;
      if (!chat_id) {
        for (const f of req.files) await deleteStoredFile(f.path).catch(() => {});
        return res.status(400).json({ error: 'chat_id is required' });
      }

      const files = [];
      for (const f of req.files) {
        const file = await fileRepository.createFile({
          chat_id,
          user_id: req.user.id,
          original_name: f.originalname,
          stored_name: f.filename,
          mime_type: f.mimetype,
          size: f.size,
          storage_path: f.path,
        });
        files.push({ ...file, size_formatted: formatFileSize(file.size), is_image: isImage(file.mime_type) });
      }

      res.status(201).json({ files });
    });
  } catch (error) {
    next(error);
  }
}

export async function getChatFiles(req, res, next) {
  try {
    const files = await fileRepository.getFilesByChatId(req.params.id);
    const enriched = files.map((f) => ({
      ...f,
      size_formatted: formatFileSize(f.size),
      is_image: isImage(f.mime_type),
    }));
    res.json({ files: enriched });
  } catch (error) {
    next(error);
  }
}

export async function getFile(req, res, next) {
  try {
    const file = await fileRepository.getFileById(req.params.fileId, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ file: { ...file, size_formatted: formatFileSize(file.size), is_image: isImage(file.mime_type) } });
  } catch (error) {
    next(error);
  }
}

function isPathSafe(storagePath) {
  const resolved = path.resolve(storagePath);
  return resolved.startsWith(UPLOADS_DIR);
}

export async function downloadFile(req, res, next) {
  try {
    const file = await fileRepository.getFileById(req.params.fileId, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (!isPathSafe(file.storage_path)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    res.download(file.storage_path, file.original_name);
  } catch (error) {
    next(error);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const file = await fileRepository.getFileById(req.params.fileId, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    await deleteStoredFile(file.storage_path);
    await fileRepository.deleteFile(req.params.fileId, req.user.id);
    res.json({ message: 'File deleted' });
  } catch (error) {
    next(error);
  }
}

export async function serveFile(req, res, next) {
  try {
    const file = await fileRepository.getFileById(req.params.fileId, req.user.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    if (!isPathSafe(file.storage_path)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }
    if (isImage(file.mime_type)) {
      res.setHeader('Content-Type', file.mime_type);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.sendFile(file.storage_path);
    } else {
      res.download(file.storage_path, file.original_name);
    }
  } catch (error) {
    next(error);
  }
}
