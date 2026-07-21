import apiClient from '../api/client';

export async function getChats(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.pinned !== undefined) query.set('pinned', params.pinned);
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  const qs = query.toString();
  const { data } = await apiClient.get(`/chat${qs ? `?${qs}` : ''}`);
  return data;
}

export async function getChat(chatId) {
  const { data } = await apiClient.get(`/chat/${chatId}`);
  return data;
}

export async function createChat(title) {
  const { data } = await apiClient.post('/chat', { title });
  return data;
}

export async function updateChat(chatId, updates) {
  const { data } = await apiClient.put(`/chat/${chatId}`, updates);
  return data;
}

export async function deleteChat(chatId) {
  const { data } = await apiClient.delete(`/chat/${chatId}`);
  return data;
}

export async function togglePinChat(chatId) {
  const { data } = await apiClient.patch(`/chat/${chatId}/pin`);
  return data;
}

export async function searchChats(query) {
  const { data } = await apiClient.get(`/chat/search?q=${encodeURIComponent(query)}`);
  return data;
}

export async function sendMessage(chatId, content, role = 'user') {
  const { data } = await apiClient.post(`/chat/${chatId}/messages`, { content, role });
  return data;
}

export async function getMessages(chatId, params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page);
  if (params.limit) query.set('limit', params.limit);
  const qs = query.toString();
  const { data } = await apiClient.get(`/chat/${chatId}/messages${qs ? `?${qs}` : ''}`);
  return data;
}

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function streamChatCompletion(chatId, message, callbacks, fileIds = []) {
  const token = localStorage.getItem('access_token');
  const baseUrl = `${API_BASE}/api`;

  const body = fileIds.length > 0 ? { message, file_ids: fileIds } : { message };

  const response = await fetch(`${baseUrl}/chat/${chatId}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Stream request failed' }));
    callbacks.onError?.(errorData.error || `HTTP ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let aiContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const data = JSON.parse(jsonStr);

          switch (data.type) {
            case 'chunk':
              aiContent += data.content;
              callbacks.onChunk?.(data.content, aiContent);
              break;
            case 'file_attachments':
              callbacks.onFileAttachments?.(data.count);
              break;
            case 'done':
              callbacks.onDone?.(data.message);
              break;
            case 'error':
              callbacks.onError?.(data.message);
              break;
          }
        } catch (e) {
          // skip malformed JSON
        }
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      callbacks.onError?.(err.message);
    }
  }
}

export async function streamSearchCompletion(chatId, message, callbacks, fileIds = []) {
  const token = localStorage.getItem('access_token');
  const baseUrl = `${API_BASE}/api`;

  const body = fileIds.length > 0 ? { message, file_ids: fileIds } : { message };

  const response = await fetch(`${baseUrl}/chat/${chatId}/search-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Search stream request failed' }));
    callbacks.onError?.(errorData.error || `HTTP ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let aiContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const data = JSON.parse(jsonStr);

          switch (data.type) {
            case 'search_results':
              callbacks.onSearchResults?.(data.results, data.count);
              break;
            case 'file_attachments':
              callbacks.onFileAttachments?.(data.count);
              break;
            case 'chunk':
              aiContent += data.content;
              callbacks.onChunk?.(data.content, aiContent);
              break;
            case 'done':
              callbacks.onDone?.(data.message, data.searchUsed, data.resultCount);
              break;
            case 'error':
              callbacks.onError?.(data.message);
              break;
          }
        } catch (e) {
          // skip malformed JSON
        }
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      callbacks.onError?.(err.message);
    }
  }
}

export async function exportChat(chatId, format = 'markdown') {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}/api/chat/${chatId}/export?format=${format}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Export failed');
  const blob = await response.blob();
  const ext = format === 'json' ? 'json' : format === 'txt' ? 'txt' : 'md';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-export.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function webSearch(query) {
  const { data } = await apiClient.get(`/chat/web-search?q=${encodeURIComponent(query)}`);
  return data;
}

export async function streamImageGeneration(chatId, prompt, callbacks) {
  const token = localStorage.getItem('access_token');
  const baseUrl = `${API_BASE}/api`;

  const response = await fetch(`${baseUrl}/images/generate/${chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Image generation request failed' }));
    callbacks.onError?.(errorData.error || `HTTP ${response.status}`);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const jsonStr = trimmed.slice(6);
        try {
          const data = JSON.parse(jsonStr);

          switch (data.type) {
            case 'generating':
              callbacks.onGenerating?.(data.status);
              break;
            case 'chunk':
              callbacks.onChunk?.(data.content, data.content);
              break;
            case 'image_done':
              callbacks.onImageDone?.(data.imageUrl, data.revisedPrompt);
              break;
            case 'done':
              callbacks.onDone?.(data.message);
              break;
            case 'error':
              callbacks.onError?.(data.message);
              break;
          }
        } catch (e) {
          // skip malformed JSON
        }
      }
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      callbacks.onError?.(err.message);
    }
  }
}
