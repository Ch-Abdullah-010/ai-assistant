import rateLimit from 'express-rate-limit';

const standardConfig = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
};

export const authLimiter = rateLimit({
  ...standardConfig,
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts. Try again in a minute.' },
  skipSuccessfulRequests: true,
});

export const signupLimiter = rateLimit({
  ...standardConfig,
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many signup attempts. Try again in an hour.' },
});

export const chatLimiter = rateLimit({
  ...standardConfig,
  windowMs: 60 * 1000,
  max: 30,
});

export const streamLimiter = rateLimit({
  ...standardConfig,
  windowMs: 60 * 1000,
  max: 20,
});

export const uploadLimiter = rateLimit({
  ...standardConfig,
  windowMs: 60 * 1000,
  max: 10,
});

export const imageGenLimiter = rateLimit({
  ...standardConfig,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Image generation limit reached. Try again in an hour.' },
});

export const adminLimiter = rateLimit({
  ...standardConfig,
  windowMs: 60 * 1000,
  max: 60,
});
