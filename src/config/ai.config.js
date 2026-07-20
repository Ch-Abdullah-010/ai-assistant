import { config } from './index.js';

const aiConfig = {
  get activeProvider() {
    return config.ai.provider;
  },

  providers: {
    gemini: {
      name: 'Google Gemini',
      apiKey: config.ai.gemini.apiKey,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: config.ai.gemini.model,
      endpoint: '/models/gemini-2.0-flash:generateContent',
    },
    deepseek: {
      name: 'DeepSeek',
      apiKey: config.ai.deepseek.apiKey,
      baseUrl: 'https://api.deepseek.com/v1',
      model: config.ai.deepseek.model,
      endpoint: '/chat/completions',
    },
    openrouter: {
      name: 'OpenRouter',
      apiKey: config.ai.openrouter.apiKey,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: config.ai.openrouter.model,
      endpoint: '/chat/completions',
    },
  },

  get activeProviderConfig() {
    return this.providers[this.activeProvider] || this.providers.gemini;
  },
};

export default aiConfig;
