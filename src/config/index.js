import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',

  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY,
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'gemini',
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: 'gemini-2.0-flash',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY,
      model: 'openai/gpt-3.5-turbo',
    },
  },

  googleSearch: {
    apiKey: process.env.GOOGLE_SEARCH_API_KEY,
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
  },

  imageGen: {
    provider: process.env.IMAGE_GEN_PROVIDER || 'openai',
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
    },
  },
};
