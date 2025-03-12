import { TournamentFormat, TournamentStatus } from '@prisma/client';
import { z } from 'zod';

/**
 * Esquema de validación para la creación de torneos
 */
export const createTournamentSchema = z.object({
  name: z.string()
    .min(1, 'El nombre del torneo es obligatorio')
    .max(100, 'El nombre del torneo no puede tener más de 100 caracteres'),
  leagueId: z.string()
    .uuid('El ID de la liga debe ser un UUID válido'),
  format: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'ROUND_ROBIN', 'SWISS'] as const, {
    errorMap: () => ({ message: 'El formato del torneo debe ser SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN o SWISS' }),
  }),
  status: z.enum(['DRAFT', 'REGISTRATION', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const, {
    errorMap: () => ({ message: 'El estado del torneo debe ser DRAFT, REGISTRATION, IN_PROGRESS, COMPLETED o CANCELLED' }),
  }).default('DRAFT'),
  startDate: z.coerce.date({
    errorMap: () => ({ message: 'La fecha de inicio debe ser una fecha válida' }),
  }),
  endDate: z.coerce.date({
    errorMap: () => ({ message: 'La fecha de fin debe ser una fecha válida' }),
  }).optional(),
  description: z.string()
    .max(500, 'La descripción no puede tener más de 500 caracteres')
    .optional(),
  maxParticipants: z.number()
    .int('El número máximo de participantes debe ser un número entero')
    .min(2, 'El número máximo de participantes debe ser al menos 2')
    .optional(),
  minParticipants: z.number()
    .int('El número mínimo de participantes debe ser un número entero')
    .min(2, 'El número mínimo de participantes debe ser al menos 2')
    .optional(),
  registrationDeadline: z.coerce.date({
    errorMap: () => ({ message: 'La fecha límite de registro debe ser una fecha válida' }),
  }).optional(),
}).refine(
  (data) => !data.endDate || data.endDate >= data.startDate,
  { message: 'La fecha de fin no puede ser anterior a la fecha de inicio' }
).refine(
  (data) => !data.registrationDeadline || data.registrationDeadline <= data.startDate,
  { message: 'La fecha límite de registro no puede ser posterior a la fecha de inicio' }
).refine(
  (data) => !data.minParticipants || !data.maxParticipants || data.minParticipants <= data.maxParticipants,
  { message: 'El número mínimo de participantes no puede ser mayor que el máximo' }
);

/**
 * Tipo para la creación de torneos
 */
export type CreateTournamentDto = z.infer<typeof createTournamentSchema>;

/**
 * Clase para la creación de torneos
 */
export class CreateTournamentClass {
  name: string;
  leagueId: string;
  format: TournamentFormat;
  status: TournamentStatus;
  startDate: Date;
  endDate?: Date;
  description?: string;
  maxParticipants?: number;
  minParticipants?: number;
  registrationDeadline?: Date;

  constructor(data: {
    name: string;
    leagueId: string;
    format: TournamentFormat;
    status?: TournamentStatus;
    startDate: Date;
    endDate?: Date;
    description?: string;
    maxParticipants?: number;
    minParticipants?: number;
    registrationDeadline?: Date;
  }) {
    this.name = data.name;
    this.leagueId = data.leagueId;
    this.format = data.format;
    this.status = data.status || TournamentStatus.DRAFT;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.description = data.description;
    this.maxParticipants = data.maxParticipants;
    this.minParticipants = data.minParticipants;
    this.registrationDeadline = data.registrationDeadline;
  }

  /**
   * Valida los datos de creación del torneo
   */
  static validate(data: unknown): CreateTournamentDto {
    return createTournamentSchema.parse(data);
  }
} 