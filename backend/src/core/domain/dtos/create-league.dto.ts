import { ScoringType } from '@prisma/client';
import { z } from 'zod';

/**
 * Esquema de validación para la creación de ligas
 */
export const createLeagueSchema = z.object({
  name: z.string().min(1, 'El nombre de la liga es obligatorio').max(100, 'El nombre de la liga no puede tener más de 100 caracteres'),
  adminId: z.string().uuid('El ID del administrador debe ser un UUID válido'),
  scoringType: z.enum(['STANDARD', 'ADVANCED', 'CUSTOM'] as const, {
    errorMap: () => ({ message: 'El tipo de puntuación debe ser STANDARD, ADVANCED o CUSTOM' }),
  }).default('STANDARD'),
  description: z.string().max(500, 'La descripción no puede tener más de 500 caracteres').optional(),
  logoUrl: z.string().url('La URL del logo debe ser una URL válida').optional(),
  isPublic: z.boolean().default(true),
});

/**
 * Tipo para la creación de ligas
 */
export type CreateLeagueDto = z.infer<typeof createLeagueSchema>;

/**
 * Clase para la creación de ligas
 */
export class CreateLeagueClass {
  name: string;
  adminId: string;
  scoringType: ScoringType;
  description?: string;
  logoUrl?: string;
  isPublic: boolean;

  constructor(data: {
    name: string;
    adminId: string;
    scoringType?: ScoringType;
    description?: string;
    logoUrl?: string;
    isPublic?: boolean;
  }) {
    this.name = data.name;
    this.adminId = data.adminId;
    this.scoringType = data.scoringType || ScoringType.STANDARD;
    this.description = data.description;
    this.logoUrl = data.logoUrl;
    this.isPublic = data.isPublic ?? true;
  }

  /**
   * Valida los datos de creación de la liga
   */
  static validate(data: unknown): CreateLeagueDto {
    return createLeagueSchema.parse(data);
  }
} 