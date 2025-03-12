import { z } from 'zod';
import { createTournamentSchema } from '../../core/domain/dtos/create-tournament.dto';
import { validate } from '../middlewares/validation.middleware';
import { TournamentFormat, TournamentStatus } from '@prisma/client';

/**
 * Validador para la creación de torneos
 */
export const validateCreateTournament = validate(
  z.object({
    body: createTournamentSchema,
  })
);

/**
 * Schema para la actualización de torneos
 */
export const updateTournamentSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  leagueId: z.string().uuid().optional(),
  format: z.nativeEnum(TournamentFormat).optional(),
  status: z.nativeEnum(TournamentStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  maxParticipants: z.number().int().positive().optional(),
  minParticipants: z.number().int().positive().optional(),
  registrationDeadline: z.coerce.date().optional(),
}).refine(data => {
  // Si hay fecha de inicio y fecha de fin, la fecha de fin debe ser posterior a la fecha de inicio
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
}).refine(data => {
  // Si hay fecha de inicio y fecha límite de registro, la fecha límite debe ser anterior a la fecha de inicio
  if (data.startDate && data.registrationDeadline) {
    return data.registrationDeadline < data.startDate;
  }
  return true;
}, {
  message: 'La fecha límite de registro debe ser anterior a la fecha de inicio',
  path: ['registrationDeadline'],
}).refine(data => {
  // Si hay participantes mínimos y máximos, el mínimo debe ser menor o igual al máximo
  if (data.minParticipants && data.maxParticipants) {
    return data.minParticipants <= data.maxParticipants;
  }
  return true;
}, {
  message: 'El número mínimo de participantes debe ser menor o igual al máximo',
  path: ['minParticipants'],
});

/**
 * Validador para la actualización de torneos
 */
export const validateUpdateTournament = validate(
  z.object({
    body: updateTournamentSchema,
  })
); 