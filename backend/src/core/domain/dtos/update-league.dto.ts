import { ScoringType } from '@prisma/client';
import { z } from 'zod';

/**
 * Esquema de validación para la actualización de ligas
 */
export const updateLeagueSchema = z.object({
  name: z.string()
    .min(1, 'El nombre de la liga es obligatorio')
    .max(100, 'El nombre de la liga no puede tener más de 100 caracteres')
    .optional(),
  description: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  scoringType: z.enum(['STANDARD', 'ADVANCED', 'CUSTOM'] as const, {
    errorMap: () => ({ message: 'El tipo de puntuación debe ser STANDARD, ADVANCED o CUSTOM' }),
  }).optional(),
  isPublic: z.boolean().optional(),
  logoUrl: z.string()
    .url('La URL del logo debe ser una URL válida')
    .max(255, 'La URL del logo no puede tener más de 255 caracteres')
    .optional()
    .nullable(),
});

/**
 * Tipo para la actualización de ligas
 */
export type UpdateLeagueDto = z.infer<typeof updateLeagueSchema>;

/**
 * Clase para la actualización de ligas
 */
export class UpdateLeagueClass {
  name?: string;
  description?: string;
  scoringType?: ScoringType;
  isPublic?: boolean;
  logoUrl?: string | null;

  constructor(data: {
    name?: string;
    description?: string;
    scoringType?: ScoringType;
    isPublic?: boolean;
    logoUrl?: string | null;
  }) {
    this.name = data.name;
    this.description = data.description;
    this.scoringType = data.scoringType;
    this.isPublic = data.isPublic;
    this.logoUrl = data.logoUrl;
  }

  /**
   * Valida los datos de actualización de la liga
   */
  static validate(data: unknown): UpdateLeagueDto {
    return updateLeagueSchema.parse(data);
  }
} 