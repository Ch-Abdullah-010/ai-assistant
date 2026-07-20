import { config } from '../config/index.js';
import { generateCompletion as geminiGenerate, generateCompletionNonStreaming as geminiNonStream } from './providers/gemini.provider.js';
import { generateCompletion as deepseekGenerate, generateCompletionNonStreaming as deepseekNonStream } from './providers/deepseek.provider.js';
import { generateCompletion as openrouterGenerate, generateCompletionNonStreaming as openrouterNonStream } from './providers/openrouter.provider.js';

const providers = {
  gemini: {
    generate: geminiGenerate,
    generateNonStream: geminiNonStream,
  },
  deepseek: {
    generate: deepseekGenerate,
    generateNonStream: deepseekNonStream,
  },
  openrouter: {
    generate: openrouterGenerate,
    generateNonStream: openrouterNonStream,
  },
};

function getActiveProvider() {
  const providerName = config.ai.provider;
  const provider = providers[providerName];

  if (!provider) {
    const available = Object.keys(providers).join(', ');
    throw new Error(
      `Unknown AI provider "${providerName}". Available providers: ${available}. Set AI_PROVIDER in your .env file.`
    );
  }

  return provider;
}

export async function generateCompletion(messages, onChunk) {
  const provider = getActiveProvider();
  return provider.generate(messages, onChunk);
}

export async function generateCompletionNonStreaming(messages) {
  const provider = getActiveProvider();
  return provider.generateNonStream(messages);
}
