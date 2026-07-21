import apiClient from '../api/client';

export async function getPrompts() {
  const { data } = await apiClient.get('/prompts');
  return data.prompts || [];
}

export async function createPrompt(title, content, category = 'general') {
  const { data } = await apiClient.post('/prompts', { title, content, category });
  return data.prompt;
}

export async function updatePrompt(id, updates) {
  const { data } = await apiClient.put(`/prompts/${id}`, updates);
  return data.prompt;
}

export async function deletePrompt(id) {
  await apiClient.delete(`/prompts/${id}`);
}
