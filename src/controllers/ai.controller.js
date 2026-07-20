import { generateCompletion } from '../services/ai.service.js';
import * as chatRepository from '../database/repositories/chat.repository.js';
import * as messageRepository from '../database/repositories/message.repository.js';
import { isImage, isTextFile, readTextContent } from '../services/file.service.js';

export async function streamChatCompletion(req, res, next) {
  try {
    const chatId = req.params.id;
    const { message, file_ids } = req.body;

    const chat = await chatRepository.findChatById(chatId, req.user.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const messageText = file_ids && file_ids.length > 0
      ? message.trim() + ' [Attached files present]'
      : message.trim();

    const userMessage = await messageRepository.createMessage(
      chatId,
      req.user.id,
      'user',
      messageText
    );

    let fileContext = '';
    if (file_ids && file_ids.length > 0) {
      const { getFileById } = await import('../database/repositories/file.repository.js');
      const { updateFileMessageId } = await import('../database/repositories/file.repository.js');

      const fileParts = [];
      for (const fileId of file_ids) {
        try {
          const file = await getFileById(fileId, req.user.id);
          if (!file) continue;
          await updateFileMessageId(fileId, req.user.id, userMessage.id).catch(() => {});

          if (isImage(file.mime_type)) {
            fileParts.push(`[Image: ${file.original_name}]`);
          } else if (isTextFile(file.mime_type)) {
            const content = await readTextContent(file.storage_path);
            if (content) {
              fileParts.push(`[File: ${file.original_name}]\n\`\`\`\n${content}\n\`\`\``);
            } else {
              fileParts.push(`[File: ${file.original_name} (${(file.size / 1024).toFixed(1)} KB)]`);
            }
          } else {
            fileParts.push(`[Document: ${file.original_name} (${(file.size / 1024).toFixed(1)} KB)]`);
          }
        } catch {
          // skip inaccessible files
        }
      }

      if (fileParts.length > 0) {
        fileContext = `\n\nThe user attached the following files:\n${fileParts.join('\n\n')}`;
      }
    }

    if (chat.title === 'New Chat') {
      const title = message.trim().slice(0, 100);
      await chatRepository.updateChat(chatId, req.user.id, { title });
    }

    const { messages } = await messageRepository.findMessagesByChatId(chatId, req.user.id, {
      limit: 100,
    });

    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const { getSupabaseClient } = await import('../database/supabase.js');
    const supabase = getSupabaseClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('system_prompt')
      .eq('id', req.user.id)
      .single();

    const globalPrompt = profile?.system_prompt?.trim();
    const chatPrompt = chat.system_prompt?.trim();
    const combinedPrompt = [globalPrompt, chatPrompt].filter(Boolean).join('\n\n');

    if (combinedPrompt) {
      conversationHistory.unshift({
        role: 'system',
        content: combinedPrompt,
      });
    }

    if (fileContext) {
      const lastUserIdx = conversationHistory.length - 1;
      if (lastUserIdx >= 0 && conversationHistory[lastUserIdx].role === 'user') {
        conversationHistory[lastUserIdx] = {
          role: 'user',
          content: conversationHistory[lastUserIdx].content + fileContext,
        };
      }
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMessage })}\n\n`);

    if (file_ids && file_ids.length > 0) {
      res.write(`data: ${JSON.stringify({ type: 'file_attachments', count: file_ids.length })}\n\n`);
    }

    let fullContent = '';
    let aborted = false;

    req.on('close', () => {
      aborted = true;
    });

    try {
      await generateCompletion(conversationHistory, (chunk) => {
        if (aborted) return;
        fullContent += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
      });

      if (!aborted) {
        const aiMessage = await messageRepository.createMessage(
          chatId,
          req.user.id,
          'assistant',
          fullContent
        );

        res.write(`data: ${JSON.stringify({ type: 'done', message: aiMessage })}\n\n`);
        res.end();
      }
    } catch (aiError) {
      if (!aborted) {
        const errorMessage = await messageRepository.createMessage(
          chatId,
          req.user.id,
          'assistant',
          `I apologize, but I encountered an error: ${aiError.message}`
        );

        res.write(`data: ${JSON.stringify({ type: 'error', message: aiError.message })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: 'done', message: errorMessage })}\n\n`);
        res.end();
      }
    }
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    }
  }
}
