import Joi from 'joi';

export enum Env {
  NODE_ENV = 'NODE_ENV',

  PORT = 'PORT',
  FRONTEND_ORIGIN = 'FRONTEND_ORIGIN',
  PDF_RENDER_URL = 'PDF_RENDER_URL',

  API_PREFIX = 'API_PREFIX',
  API_VERSION = 'API_VERSION',

  CLERK_WEBHOOK_SECRET = 'CLERK_WEBHOOK_SECRET',
  CLERK_PUBLISHABLE_KEY = 'CLERK_PUBLISHABLE_KEY',
  CLERK_SECRET_KEY = 'CLERK_SECRET_KEY',

  DATABASE_URL = 'DATABASE_URL',
  REDIS_URL = 'REDIS_URL',
  REDIS_NAMESPACE = 'REDIS_NAMESPACE',

  THROTTLE_TTL = 'THROTTLE_TTL',
  THROTTLE_LIMIT = 'THROTTLE_LIMIT',

  GEMINI_API_KEY = 'GEMINI_API_KEY',
  GEMINI_LIVE_MODEL = 'GEMINI_LIVE_MODEL',
  GEMINI_MODEL = 'GEMINI_MODEL',

  RESEND_API_KEY = 'RESEND_API_KEY',
  MAIL_FROM_ADDRESS = 'MAIL_FROM_ADDRESS',
  MAIL_DAILY_LIMIT_PER_USER = 'MAIL_DAILY_LIMIT_PER_USER',
  GEMINI_FALLBACK_MODEL = 'GEMINI_FALLBACK_MODEL',
}

export const validationSchema = Joi.object({
  [Env.NODE_ENV]: Joi.string().optional(),

  [Env.PORT]: Joi.number().required(),
  [Env.FRONTEND_ORIGIN]: Joi.string().required(),
  // Base URL headless Chromium opens to render /print (defaults to FRONTEND_ORIGIN)
  [Env.PDF_RENDER_URL]: Joi.string().uri().optional(),

  [Env.API_PREFIX]: Joi.string().default('api'),
  [Env.API_VERSION]: Joi.string().default('1'),

  [Env.CLERK_WEBHOOK_SECRET]: Joi.string().required(),
  [Env.CLERK_PUBLISHABLE_KEY]: Joi.string().required(),
  [Env.CLERK_SECRET_KEY]: Joi.string().required(),

  [Env.DATABASE_URL]: Joi.string().required(),
  [Env.REDIS_URL]: Joi.string().required(),
  [Env.REDIS_NAMESPACE]: Joi.string().default('cv-builder'),

  [Env.THROTTLE_TTL]: Joi.number().default(60000),
  [Env.THROTTLE_LIMIT]: Joi.number().default(10),

  [Env.GEMINI_API_KEY]: Joi.string().required(),
  [Env.GEMINI_LIVE_MODEL]: Joi.string(),
  [Env.GEMINI_MODEL]: Joi.string().default('gemini-3.5-flash-lite'),
  // Used when GEMINI_MODEL stays overloaded; empty to disable
  [Env.GEMINI_FALLBACK_MODEL]: Joi.string()
    .allow('')
    .default('gemini-3.1-flash-lite'),

  // Optional: without them, sending answers 503 and drafts still work
  [Env.RESEND_API_KEY]: Joi.string().optional(),
  [Env.MAIL_FROM_ADDRESS]: Joi.string().email().optional(),
  [Env.MAIL_DAILY_LIMIT_PER_USER]: Joi.number().integer().min(1).default(5),
});
