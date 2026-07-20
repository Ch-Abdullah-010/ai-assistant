import { config } from '../../config/index.js';

export const openrouterConfig = {
  name: 'OpenRouter',
  baseUrl: 'https://openrouter.ai/api/v1',
  model: config.ai.openrouter.model || 'openai/gpt-3.5-turbo',
  apiKey: config.ai.openrouter.apiKey,
};

function formatMessages(messages) {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

function parseOpenrouterResponse(data) {
  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response generated');
  }
  return data.choices[0].message.content;
}

async function makeRequest(url, options, onChunk) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`OpenRouter API error ${response.status}: ${errorText}`);
  }

  if (!onChunk) {
    const data = await response.json();
    return parseOpenrouterResponse(data);
  }

  let fullText = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

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
      if (jsonStr === '[DONE]') continue;

      try {
        const data = JSON.parse(jsonStr);
        const content = data.choices?.[0]?.delta?.content || data.choices?.[0]?.message?.content || '';
        if (content) {
          fullText += content;
          if (onChunk) onChunk(content);
        }
      } catch (e) {
        // skip malformed JSON
      }
    }
  }

  return fullText;
}

export async function generateCompletion(messages, onChunk) {
  const { apiKey, baseUrl, model } = openrouterConfig;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key not configured. Set OPENROUTER_API_KEY in your .env file.');
  }

  const url = `${baseUrl}/chat/completions`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'AI Assistant',
    },
    body: JSON.stringify({
      model,
      messages: formatMessages(messages),
      stream: !!onChunk,
      max_tokens: 4096,
    }),
  };

  return makeRequest(url, options, onChunk);
}

export const generateCompletionNonStreaming = (messages) => generateCompletion(messages, null);
