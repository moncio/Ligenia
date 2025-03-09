import { z } from 'zod';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Esquema de validación para variables de entorno
const envSchema = z.object({
  // Entorno de la aplicación
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Puerto del servidor
  PORT: z.string().transform(val => parseInt(val, 10)).default('3000'),
  
  // Base de datos
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('1d'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Supabase (opcionales para desarrollo local)
  SUPABASE_URL: z.string().optional(),
  SUPABASE_KEY: z.string().optional(),
  
  // OpenAI (opcional para desarrollo inicial)
  OPENAI_API_KEY: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  
  // Cors
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

// Validar y exportar variables de entorno
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data; 