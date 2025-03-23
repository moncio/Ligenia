import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';

// Input validation schema
const CreateTournamentInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional().default(''),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  endDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional()
    .nullable(),
  format: z.nativeEnum(TournamentFormat, {
    errorMap: () => ({ message: 'Invalid tournament format' }),
  }),
  status: z
    .nativeEnum(TournamentStatus, {
      errorMap: () => ({ message: 'Invalid tournament status' }),
    })
    .default(TournamentStatus.DRAFT),
  location: z.string().max(100).optional().nullable(),
  maxParticipants: z.number().int().min(2).max(128).optional().nullable(),
  registrationDeadline: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional()
    .nullable(),
  category: z
    .nativeEnum(PlayerLevel, {
      errorMap: () => ({ message: 'Invalid player level category' }),
    })
    .optional()
    .nullable(),
  createdById: z.string().uuid(),
});

type CreateTournamentInput = z.infer<typeof CreateTournamentInputSchema>;

export class CreateTournamentUseCase extends BaseUseCase<CreateTournamentInput, Tournament> {
  constructor(private tournamentRepository: ITournamentRepository) {
    super();
  }

  protected async executeImpl(input: CreateTournamentInput): Promise<Result<Tournament>> {
    try {
      // Validate input
      const validation = CreateTournamentInputSchema.safeParse(input);
      if (!validation.success) {
        return Result.fail<Tournament>(new Error(validation.error.errors[0].message));
      }

      const validatedData = validation.data;

      // Convert string dates to Date objects
      const startDate = new Date(validatedData.startDate);
      const endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
      const registrationDeadline = validatedData.registrationDeadline
        ? new Date(validatedData.registrationDeadline)
        : null;

      // Validate business rules
      if (endDate && startDate > endDate) {
        return Result.fail<Tournament>(new Error('End date must be after start date'));
      }

      if (registrationDeadline && registrationDeadline > startDate) {
        return Result.fail<Tournament>(
          new Error('Registration deadline must be before start date'),
        );
      }

      // Create new tournament entity with proper null handling
      const tournament = new Tournament(
        '', // ID will be assigned by repository
        validatedData.name,
        validatedData.description,
        startDate,
        endDate,
        validatedData.format,
        validatedData.status,
        validatedData.location ?? null,
        validatedData.maxParticipants ?? null,
        registrationDeadline,
        validatedData.category ?? null,
        validatedData.createdById,
      );

      // Save tournament
      await this.tournamentRepository.save(tournament);

      return Result.ok<Tournament>(tournament);
    } catch (error) {
      return Result.fail<Tournament>(
        error instanceof Error ? error : new Error('Failed to create tournament'),
      );
    }
  }
}
