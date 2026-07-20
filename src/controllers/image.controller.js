import path from 'path';
import { fileURLToPath } from 'url';
import { generateImage } from '../services/image.service.js';
import * as chatRepository from '../database/repositories/chat.repository.js';
import * as messageRepository from '../database/repositories/message.repository.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = path.resolve(__dirname, '../../uploads/generated');

export async function streamImageGeneration(req, res, next) {
  try {
    const chatId = req.params.id;
    const { prompt } = req.body;

    const chat = await chatRepository.findChatById(chatId, req.user.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Image prompt is required' });
    }

    const userMessage = await messageRepository.createMessage(
      chatId,
      req.user.id,
      'user',
      `🎨 Generate image: ${prompt.trim()}`
    );

    if (chat.title === 'New Chat') {
      const title = `Image: ${prompt.trim().slice(0, 80)}`;
      await chatRepository.updateChat(chatId, req.user.id, { title });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMessage })}\n\n`);

    res.write(`data: ${JSON.stringify({ type: 'generating', status: 'Generating image...' })}\n\n`);

    try {
      const result = await generateImage(prompt.trim());

      const imageUrl = `/api/images/file/${result.filename}`;
      const content = `![${result.revisedPrompt}](${imageUrl})\n\n*${result.revisedPrompt}*`;

      const aiMessage = await messageRepository.createMessage(
        chatId,
        req.user.id,
        'assistant',
        content
      );

      res.write(`data: ${JSON.stringify({ type: 'chunk', content: content })}\n\n`);
      res.write(`data: ${JSON.stringify({
        type: 'image_done',
        message: aiMessage,
        imageUrl,
        revisedPrompt: result.revisedPrompt,
      })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: 'done', message: aiMessage })}\n\n`);
      res.end();
    } catch (genError) {
      if (genError.message === 'IMAGE_GEN_UNAVAILABLE') {
        const content = `I don't have an image generation API configured. To enable image generation, add your OpenAI API key to the server .env file.`;

        const aiMessage = await messageRepository.createMessage(
          chatId,
          req.user.id,
          'assistant',
          content
        );

        res.write(`data: ${JSON.stringify({ type: 'chunk', content })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'done', message: aiMessage })}\n\n`);
        res.end();
      } else {
        const errorContent = `Failed to generate image: ${genError.message}`;

        res.write(`data: ${JSON.stringify({ type: 'error', message: genError.message })}\n\n`);

        const aiMessage = await messageRepository.createMessage(
          chatId,
          req.user.id,
          'assistant',
          errorContent
        );

        res.write(`data: ${JSON.stringify({ type: 'done', message: aiMessage })}\n\n`);
        res.end();
      }
    }
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    }
  }
}

export async function serveGeneratedImage(req, res, next) {
  try {
    const { filename } = req.params;
    const filePath = path.resolve(GENERATED_DIR, filename);

    if (!filePath.startsWith(GENERATED_DIR)) {
      return res.status(403).json({ error: 'Invalid file path' });
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
}
