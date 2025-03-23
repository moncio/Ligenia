import { z } from 'zod';
import { MatchStatus } from '@prisma/client';

// Esquema para validar el parámetro ID
export const idParamSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid UUID format'
  })
});

// Esquema para validar la creación de un partido
export const createMatchSchema = z.object({
  player1Id: z.string().uuid({
    message: 'Invalid player 1 ID format'
  }),
  player2Id: z.string().uuid({
    message: 'Invalid player 2 ID format'
  }),
  tournamentId: z.string().uuid({
    message: 'Invalid tournament ID format'
  }),
  scheduledDate: z.string().datetime({
    message: 'Invalid date format, must be ISO 8601'
  }),
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters'
  }).optional(),
  status: z.nativeEnum(MatchStatus, {
    errorMap: () => ({ message: 'Status must be a valid MatchStatus' })
  }).optional()
});

// Esquema para validar la actualización de un partido
export const updateMatchSchema = z.object({
  player1Id: z.string().uuid({
    message: 'Invalid player 1 ID format'
  }).optional(),
  player2Id: z.string().uuid({
    message: 'Invalid player 2 ID format'
  }).optional(),
  tournamentId: z.string().uuid({
    message: 'Invalid tournament ID format'
  }).optional(),
  scheduledDate: z.string().datetime({
    message: 'Invalid date format, must be ISO 8601'
  }).optional(),
  location: z.string().min(2, {
    message: 'Location must be at least 2 characters'
  }).optional(),
  status: z.nativeEnum(MatchStatus, {
    errorMap: () => ({ message: 'Status must be a valid MatchStatus' })
  }).optional()
});

// Esquema para validar la actualización del resultado de un partido
export const updateScoreSchema = z.object({
  player1Score: z.number().int().nonnegative({
    message: 'Player 1 score must be a non-negative integer'
  }),
  player2Score: z.number().int().nonnegative({
    message: 'Player 2 score must be a non-negative integer'
  }),
  status: z.nativeEnum(MatchStatus, {
    errorMap: () => ({ message: 'Status must be a valid MatchStatus' })
  }),
  notes: z.string().max(500, {
    message: 'Notes must be at most 500 characters'
  }).optional()
});

// Esquema para validar los parámetros de consulta al obtener partidos
export const getMatchesQuerySchema = z.object({
  tournamentId: z.string().uuid({
    message: 'Invalid tournament ID format'
  }).optional(),
  player1Id: z.string().uuid({
    message: 'Invalid player 1 ID format'
  }).optional(),
  player2Id: z.string().uuid({
    message: 'Invalid player 2 ID format'
  }).optional(),
  status: z.nativeEnum(MatchStatus, {
    errorMap: () => ({ message: 'Status must be a valid MatchStatus' })
  }).optional(),
  fromDate: z.string().datetime({
    message: 'Invalid date format, must be ISO 8601'
  }).optional(),
  toDate: z.string().datetime({
    message: 'Invalid date format, must be ISO 8601'
  }).optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional()
}); 