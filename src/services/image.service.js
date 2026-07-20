import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = path.resolve(__dirname, '../../uploads/generated');
await fs.mkdir(GENERATED_DIR, { recursive: true });

async function generateWithOpenAI(prompt) {
  const { apiKey, model, size, quality } = config.imageGen.openai;

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('IMAGE_GEN_UNAVAILABLE');
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      n: 1,
      size,
      quality,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorData = await response.text().catch(() => '');
    throw new Error(`OpenAI image generation failed: ${response.status} ${errorData}`);
  }

  const data = await response.json();
  const b64Data = data.data[0].b64_json;
  const revisedPrompt = data.data[0].revised_prompt || prompt;

  const filename = `gen_${Date.now()}_${Math.random().toString(36).slice(2)}.png`;
  const filePath = path.join(GENERATED_DIR, filename);

  const buffer = Buffer.from(b64Data, 'base64');
  await fs.writeFile(filePath, buffer);

  return {
    filePath,
    filename,
    revisedPrompt,
    url: null,
  };
}

export async function generateImage(prompt) {
  const provider = config.imageGen.provider;

  if (provider === 'openai') {
    return generateWithOpenAI(prompt);
  }

  throw new Error(`Unknown image provider "${provider}". Supported: openai`);
}

export async function getGeneratedImageUrl(filename) {
  return `/api/images/file/${filename}`;
}
