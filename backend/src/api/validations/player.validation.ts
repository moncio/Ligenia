import { PlayerLevel } from '@prisma/client';
import { z } from 'zod';

// Esquema para validar el parámetro ID
export const idParamSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid UUID format',
  }),
});

// Esquema para validar la creación de un jugador
export const createPlayerSchema = z.object({
  userId: z.string().uuid({
    message: 'Invalid user ID format',
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters',
  }),
  level: z.nativeEnum(PlayerLevel, {
    errorMap: () => ({ message: 'Level must be a valid PlayerLevel' }),
  }),
  bio: z
    .string()
    .max(500, {
      message: 'Bio must be at most 500 characters',
    })
    .optional(),
  country: z
    .string()
    .min(2, {
      message: 'Country must be at least 2 characters',
    })
    .optional(),
});

// Esquema para validar la actualización de un jugador
export const updatePlayerSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters',
    })
    .optional(),
  level: z
    .nativeEnum(PlayerLevel, {
      errorMap: () => ({ message: 'Level must be a valid PlayerLevel' }),
    })
    .optional(),
  bio: z
    .string()
    .max(500, {
      message: 'Bio must be at most 500 characters',
    })
    .optional(),
  country: z
    .string()
    .min(2, {
      message: 'Country must be at least 2 characters',
    })
    .optional(),
  isActive: z.boolean().optional(),
});

// Esquema para validar los parámetros de consulta al obtener jugadores
export const getPlayersQuerySchema = z.object({
  name: z.string().optional(),
  level: z
    .nativeEnum(PlayerLevel, {
      errorMap: () => ({ message: 'Level must be a valid PlayerLevel' }),
    })
    .optional(),
  country: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  limit: z.coerce.number().positive().optional(),
  offset: z.coerce.number().nonnegative().optional(),
});

// Exporting all validation schemas together
export const playerValidationSchema = {
  createPlayerSchema,
  updatePlayerSchema,
  getPlayersSchema: getPlayersQuerySchema
};
