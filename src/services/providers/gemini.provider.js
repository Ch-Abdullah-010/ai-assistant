import { config } from '../../config/index.js';

export const geminiConfig = {
  name: 'Google Gemini',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  model: config.ai.gemini.model || 'gemini-2.0-flash',
  apiKey: config.ai.gemini.apiKey,
};

function formatMessages(messages) {
  const contents = [];
  let systemInstruction = null;

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = msg.content;
      continue;
    }
    if (msg.role === 'user' || msg.role === 'assistant') {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }

  const requestBody = { contents };

  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] });
  }

  if (systemInstruction) {
    requestBody.system_instruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  return requestBody;
}

function parseGeminiResponse(data) {
  if (!data.candidates || data.candidates.length === 0) {
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
    }
    throw new Error('No response generated');
  }

  const candidate = data.candidates[0];
  if (candidate.finishReason && candidate.finishReason !== 'STOP') {
    if (candidate.finishReason === 'SAFETY') {
      throw new Error('Response blocked by safety filters');
    }
  }

  const text = candidate.content?.parts?.[0]?.text || '';
  return text;
}

export async function generateCompletion(messages, onChunk) {
  const { apiKey, baseUrl, model } = geminiConfig;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your .env file.');
  }

  const requestBody = formatMessages(messages);
  const url = `${baseUrl}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
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
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (text) {
          fullText += text;
          if (onChunk) onChunk(text);
        }
      } catch (e) {
        // skip malformed JSON chunks
      }
    }
  }

  return fullText;
}

export async function generateCompletionNonStreaming(messages) {
  const { apiKey, baseUrl, model } = geminiConfig;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key not configured.');
  }

  const requestBody = formatMessages(messages);
  const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Gemini API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return parseGeminiResponse(data);
}
