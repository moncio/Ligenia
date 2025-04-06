import { z } from 'zod';

// Esquema de validación para parámetros de ID
export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid statistic ID format' }),
});

// Esquema de validación para parámetros de usuario
export const userIdParamSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
});

// Esquema de validación para parámetros de jugador
export const playerIdParamSchema = z.object({
  playerId: z.string().uuid({ message: 'Invalid player ID format' }),
});

// Esquema de validación para parámetros de torneo
export const tournamentIdParamSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Invalid tournament ID format' }),
});

// Esquema de validación para parámetros de partido
export const matchIdParamSchema = z.object({
  matchId: z.string().uuid({ message: 'Invalid match ID format' }),
});

// Esquema de validación para la creación de estadísticas
export const createStatisticSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  tournamentId: z.string().uuid({ message: 'Invalid tournament ID format' }),
  matchesPlayed: z.number().int().min(0).default(0),
  wins: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
  points: z.number().int().min(0).default(0),
  rank: z.number().int().min(0).default(0),
});

// Esquema de validación para la actualización de estadísticas
export const updateStatisticSchema = z.object({
  matchesPlayed: z.number().int().min(0).optional(),
  wins: z.number().int().min(0).optional(),
  losses: z.number().int().min(0).optional(),
  points: z.number().int().min(0).optional(),
  rank: z.number().int().min(0).optional(),
});

// Esquema de validación para consulta de estadísticas
export const getStatisticsQuerySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }).optional(),
  tournamentId: z.string().uuid({ message: 'Invalid tournament ID format' }).optional(),
  year: z
    .string()
    .regex(/^\d{4}$/, { message: 'Year must be a 4-digit number' })
    .optional(),
  limit: z.string().regex(/^\d+$/, { message: 'Limit must be a number' }).optional(),
  offset: z.string().regex(/^\d+$/, { message: 'Offset must be a number' }).optional(),
  page: z.string().regex(/^\d+$/, { message: 'Page must be a number' }).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  filters: z.string().optional(), // JSON string to be parsed
});

// Esquema de validación para consulta de rankings
export const getRankingsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/, { message: 'Limit must be a number' }).optional(),
  offset: z.string().regex(/^\d+$/, { message: 'Offset must be a number' }).optional(),
  page: z.string().regex(/^\d+$/, { message: 'Page must be a number' }).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});
