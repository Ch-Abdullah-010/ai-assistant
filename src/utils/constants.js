export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  SETTINGS: '/settings',
};

export const AI_PROVIDERS = {
  GEMINI: 'gemini',
  DEEPSEEK: 'deepseek',
  OPENROUTER: 'openrouter',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const FILE_TYPES = {
  PDF: 'application/pdf',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TXT: 'text/plain',
  IMAGE: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
};

export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
