import { z } from 'zod';
import { PlayerLevel, TournamentFormat, TournamentStatus } from '@prisma/client';

// Esquema de validación para parámetros de ID
export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid tournament ID format' })
});

// Esquema de validación para la creación de torneos
export const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }).optional(),
  format: z.nativeEnum(TournamentFormat, {
    errorMap: () => ({ message: 'Format must be a valid TournamentFormat' })
  }),
  status: z.nativeEnum(TournamentStatus, {
    errorMap: () => ({ message: 'Status must be a valid TournamentStatus' })
  }).default(TournamentStatus.DRAFT),
  location: z.string().max(100).optional(),
  maxParticipants: z.number().int().min(2).max(128).optional(),
  registrationDeadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }).optional(),
  category: z.nativeEnum(PlayerLevel, {
    errorMap: () => ({ message: 'Category must be a valid PlayerLevel' })
  }).optional(),
});

// Esquema de validación para la actualización de torneos
export const updateTournamentSchema = createTournamentSchema.partial();

// Esquema de validación para el registro en torneos
export const registerForTournamentSchema = z.object({
  playerId: z.string().uuid({ message: 'Invalid player ID format' })
});

// Esquema de validación para filtrado de torneos
export const getTournamentsQuerySchema = z.object({
  status: z.nativeEnum(TournamentStatus, {
    errorMap: () => ({ message: 'Status must be a valid TournamentStatus' })
  }).optional(),
  category: z.nativeEnum(PlayerLevel, {
    errorMap: () => ({ message: 'Category must be a valid PlayerLevel' })
  }).optional(),
}); 