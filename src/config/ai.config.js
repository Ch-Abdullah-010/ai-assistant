const aiConfig = {
  provider: import.meta.env.VITE_AI_PROVIDER || 'gemini',

  providers: {
    gemini: {
      name: 'Google Gemini',
      apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'gemini-2.0-flash',
      endpoint: '/models/gemini-2.0-flash:generateContent',
    },
    deepseek: {
      name: 'DeepSeek',
      apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
      endpoint: '/chat/completions',
    },
    openrouter: {
      name: 'OpenRouter',
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openai/gpt-3.5-turbo',
      endpoint: '/chat/completions',
    },
  },

  get activeProvider() {
    return this.providers[this.provider] || this.providers.gemini;
  },
};

export default aiConfig;
