import * as promptRepository from '../database/repositories/prompt.repository.js';

export async function listPrompts(req, res, next) {
  try {
    const { category, page, limit } = req.query;
    const result = await promptRepository.getPrompts(req.user.id, {
      category,
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 100, 200),
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function createPrompt(req, res, next) {
  try {
    const { title, content, category } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const prompt = await promptRepository.createPrompt(req.user.id, { title, content, category });
    res.status(201).json({ prompt });
  } catch (error) {
    next(error);
  }
}

export async function updatePrompt(req, res, next) {
  try {
    const prompt = await promptRepository.updatePrompt(req.params.id, req.user.id, req.body);
    res.json({ prompt });
  } catch (error) {
    next(error);
  }
}

export async function deletePrompt(req, res, next) {
  try {
    await promptRepository.deletePrompt(req.params.id, req.user.id);
    res.json({ message: 'Prompt deleted' });
  } catch (error) {
    next(error);
  }
}
