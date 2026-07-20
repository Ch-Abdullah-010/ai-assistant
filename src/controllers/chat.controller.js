import * as chatRepository from '../database/repositories/chat.repository.js';
import * as messageRepository from '../database/repositories/message.repository.js';

export async function listChats(req, res, next) {
  try {
    const { search, pinned, page, limit } = req.query;

    const result = await chatRepository.findChatsByUserId(req.user.id, {
      search,
      pinned: pinned !== undefined ? pinned === 'true' : undefined,
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 50, 100),
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getChat(req, res, next) {
  try {
    const chat = await chatRepository.findChatById(req.params.id, req.user.id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = await messageRepository.findMessagesByChatId(
      req.params.id,
      req.user.id,
      { limit: 200 }
    );

    res.json({
      chat,
      messages: messages.messages,
    });
  } catch (error) {
    next(error);
  }
}

export async function createChat(req, res, next) {
  try {
    const { title } = req.body;

    const chat = await chatRepository.createChat(
      req.user.id,
      title || 'New Chat'
    );

    res.status(201).json({ chat });
  } catch (error) {
    next(error);
  }
}

export async function updateChat(req, res, next) {
  try {
    const { title, pinned } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (pinned !== undefined) updates.pinned = pinned;

    const chat = await chatRepository.updateChat(
      req.params.id,
      req.user.id,
      updates
    );

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    next(error);
  }
}

export async function deleteChat(req, res, next) {
  try {
    const chat = await chatRepository.findChatById(req.params.id, req.user.id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await chatRepository.deleteChat(req.params.id, req.user.id);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function togglePinChat(req, res, next) {
  try {
    const chat = await chatRepository.findChatById(req.params.id, req.user.id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const updated = await chatRepository.updateChat(
      req.params.id,
      req.user.id,
      { pinned: !chat.pinned }
    );

    res.json({ chat: updated });
  } catch (error) {
    next(error);
  }
}

export async function searchChats(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      const result = await chatRepository.findChatsByUserId(req.user.id);
      return res.json(result);
    }

    const result = await chatRepository.searchChats(req.user.id, q);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const chatId = req.params.id;
    const { content, role, file_ids } = req.body;

    const chat = await chatRepository.findChatById(chatId, req.user.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const message = await messageRepository.createMessage(
      chatId,
      req.user.id,
      role || 'user',
      content.trim()
    );

    if (file_ids && file_ids.length > 0) {
      const { updateFileMessageId } = await import('../database/repositories/file.repository.js');
      for (const fileId of file_ids) {
        await updateFileMessageId(fileId, req.user.id, message.id).catch(() => {});
      }
    }

    if (chat.title === 'New Chat') {
      const title = content.trim().slice(0, 100);
      await chatRepository.updateChat(chatId, req.user.id, { title });
    }

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
}

export async function listMessages(req, res, next) {
  try {
    const chatId = req.params.id;
    const { page, limit } = req.query;

    const chat = await chatRepository.findChatById(chatId, req.user.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const result = await messageRepository.findMessagesByChatId(
      chatId,
      req.user.id,
      {
        page: parseInt(page) || 1,
        limit: Math.min(parseInt(limit) || 100, 500),
      }
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
}
