import { z } from 'zod';

// Esquema de validación para parámetros de ID
export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid performance history ID format' })
});

// Esquema de validación para parámetros de usuario
export const userIdParamSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' })
});

// Esquema de validación para la creación de un registro de historial de rendimiento
export const createPerformanceSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  matchesPlayed: z.number().int().min(0).default(0),
  wins: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
  points: z.number().int().min(0).default(0)
});

// Esquema de validación para la actualización de un registro de historial de rendimiento
export const updatePerformanceSchema = z.object({
  matchesPlayed: z.number().int().min(0).optional(),
  wins: z.number().int().min(0).optional(),
  losses: z.number().int().min(0).optional(),
  points: z.number().int().min(0).optional()
});

// Esquema de validación para consulta de historial de rendimiento
export const getPerformanceQuerySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }).optional(),
  year: z.string().regex(/^\d{4}$/, { message: 'Year must be a 4-digit number' }).optional(),
  month: z.string().regex(/^([1-9]|1[0-2])$/, { message: 'Month must be a number between 1 and 12' }).optional(),
  limit: z.string().regex(/^\d+$/, { message: 'Limit must be a number' }).optional(),
  offset: z.string().regex(/^\d+$/, { message: 'Offset must be a number' }).optional()
});

// Esquema de validación para consulta de tendencias de rendimiento
export const performanceTrendsQuerySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  timeframe: z.enum(['monthly', 'yearly', 'all'], {
    errorMap: () => ({ message: 'Timeframe must be monthly, yearly, or all' })
  }).optional()
}); 