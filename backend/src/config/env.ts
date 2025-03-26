import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validation schema for environment variables
const envSchema = z.object({
  // Application environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server port
  PORT: z
    .string()
    .transform(val => parseInt(val, 10))
    .default('3000'),

  // Database
  DATABASE_URL: z
    .string()
    .optional()
    .default('postgresql://postgres:postgres@localhost:5432/ligenia'),

  // JWT
  JWT_SECRET: z.string().min(10).optional().default('supersecretkey1234567890'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Supabase (optional for local development)
  SUPABASE_URL: z.string().optional().default('https://example.supabase.co'),
  SUPABASE_KEY: z.string().optional().default('your-supabase-key'),

  // OpenAI (optional for initial development)
  OPENAI_API_KEY: z.string().optional(),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_FORMAT: z.enum(['json', 'simple', 'colorized']).default('json'),
  LOG_REDACT_SENSITIVE: z.string().transform(val => val === 'true').default('true'),
  LOG_TO_FILE: z.string().transform(val => val === 'true').default('true'),
  LOG_ROTATION: z.string().transform(val => val === 'true').default('true'),
  LOG_RETENTION_DAYS: z.string().transform(val => parseInt(val, 10)).default('14'),
  LOG_MAX_SIZE: z.string().transform(val => parseInt(val, 10)).default('20'),

  // Cors
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

// Validate and export environment variables
const _env = envSchema.safeParse(process.env);

// In test environment, don't throw errors if variables are missing
if (!_env.success && process.env.NODE_ENV !== 'test') {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

// If we're in test environment and there's an error, use default values
export const env = _env.success
  ? _env.data
  : {
      NODE_ENV: 'test',
      PORT: 3000,
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/ligenia_test',
      JWT_SECRET: 'test-jwt-secret-key-1234567890',
      JWT_EXPIRES_IN: '1d',
      JWT_REFRESH_EXPIRES_IN: '7d',
      SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_KEY: 'your-supabase-key',
      LOG_LEVEL: 'info',
      LOG_FORMAT: 'json',
      LOG_REDACT_SENSITIVE: true,
      LOG_TO_FILE: true,
      LOG_ROTATION: true,
      LOG_RETENTION_DAYS: 14,
      LOG_MAX_SIZE: 20,
      CORS_ORIGIN: 'http://localhost:3000',
    };
