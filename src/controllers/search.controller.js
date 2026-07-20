import { searchWithFallback, formatSearchResultsForPrompt } from '../services/search.service.js';
import { generateCompletion, generateCompletionNonStreaming } from '../services/ai.service.js';
import * as chatRepository from '../database/repositories/chat.repository.js';
import * as messageRepository from '../database/repositories/message.repository.js';

export async function searchOnly(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const { results, source } = await searchWithFallback(q);

    if (source === 'ai') {
      const aiResponse = await generateCompletionNonStreaming([
        { role: 'user', content: q },
      ]);

      return res.json({
        results: [],
        source: 'ai',
        answer: aiResponse,
        query: q,
      });
    }

    res.json({
      results,
      source: 'web',
      answer: null,
      query: q,
    });
  } catch (error) {
    next(error);
  }
}

export async function searchAndStream(req, res, next) {
  try {
    const chatId = req.params.id;
    const { message } = req.body;

    const chat = await chatRepository.findChatById(chatId, req.user.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMessage = await messageRepository.createMessage(
      chatId,
      req.user.id,
      'user',
      message.trim()
    );

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

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMessage })}\n\n`);

    const { results, source } = await searchWithFallback(message);

    if (source === 'web' && results.length > 0) {
      res.write(`data: ${JSON.stringify({ type: 'search_results', results, count: results.length })}\n\n`);
    }

    const searchContext = source === 'web'
      ? formatSearchResultsForPrompt(results, message)
      : null;

    let augmentedMessages = [...conversationHistory];

    if (searchContext) {
      augmentedMessages = [
        {
          role: 'system',
          content: `You are a helpful AI assistant. When answering, incorporate the following web search results and cite your sources.\n\n${searchContext}`,
        },
        ...conversationHistory.filter((m) => m.role !== 'system'),
      ];
    }

    let fullContent = '';
    let aborted = false;

    req.on('close', () => {
      aborted = true;
    });

    try {
      await generateCompletion(augmentedMessages, (chunk) => {
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

        res.write(`data: ${JSON.stringify({
          type: 'done',
          message: aiMessage,
          searchUsed: source === 'web',
          resultCount: results.length,
        })}\n\n`);
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
