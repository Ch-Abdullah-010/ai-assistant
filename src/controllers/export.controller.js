import * as chatRepository from '../database/repositories/chat.repository.js';
import * as messageRepository from '../database/repositories/message.repository.js';

export async function exportChat(req, res, next) {
  try {
    const chatId = req.params.id;
    const format = req.query.format || 'markdown';

    if (!['markdown', 'json', 'txt'].includes(format)) {
      return res.status(400).json({ error: 'Format must be one of: markdown, json, txt' });
    }

    const chat = await chatRepository.findChatById(chatId, req.user.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const { messages } = await messageRepository.findMessagesByChatId(chatId, req.user.id, {
      limit: 10000,
    });

    const date = new Date().toISOString().slice(0, 10);
    const filename = `${chat.title.replace(/[^a-zA-Z0-9]/g, '_')}_${date}`;

    if (format === 'json') {
      const json = JSON.stringify({
        title: chat.title,
        exported_at: new Date().toISOString(),
        message_count: messages.length,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          created_at: m.created_at,
        })),
      }, null, 2);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      return res.send(json);
    }

    if (format === 'txt') {
      const lines = messages.map((m) => {
        const who = m.role === 'user' ? 'You' : 'AI';
        const time = new Date(m.created_at).toLocaleString();
        return `[${who}] ${time}\n${m.content}\n`;
      });

      const text = `Chat: ${chat.title}\nExported: ${new Date().toLocaleString()}\n${'='.repeat(40)}\n\n${lines.join('\n')}`;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.txt"`);
      return res.send(text);
    }

    const md = `# ${chat.title}\n\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n${messages.map((m) => {
      const who = m.role === 'user' ? '**You**' : '**AI**';
      return `### ${who}\n\n${m.content}\n\n---\n`;
    }).join('\n')}`;

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.md"`);
    res.send(md);
  } catch (error) {
    next(error);
  }
}
