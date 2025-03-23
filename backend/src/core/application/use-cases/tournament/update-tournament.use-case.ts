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
const UpdateTournamentInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(100).optional(),
  description: z.string().max(500).optional(),
  startDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
  endDate: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional()
    .nullable(),
  format: z
    .nativeEnum(TournamentFormat, {
      errorMap: () => ({ message: 'Invalid tournament format' }),
    })
    .optional(),
  status: z
    .nativeEnum(TournamentStatus, {
      errorMap: () => ({ message: 'Invalid tournament status' }),
    })
    .optional(),
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
});

type UpdateTournamentInput = z.infer<typeof UpdateTournamentInputSchema>;

export class UpdateTournamentUseCase extends BaseUseCase<UpdateTournamentInput, Tournament> {
  constructor(private tournamentRepository: ITournamentRepository) {
    super();
  }

  protected async executeImpl(input: UpdateTournamentInput): Promise<Result<Tournament>> {
    try {
      // Validate input
      const validation = UpdateTournamentInputSchema.safeParse(input);
      if (!validation.success) {
        return Result.fail<Tournament>(new Error(validation.error.errors[0].message));
      }

      const validatedData = validation.data;

      // Find tournament
      const tournament = await this.tournamentRepository.findById(validatedData.id);
      if (!tournament) {
        return Result.fail<Tournament>(
          new Error(`Tournament with ID ${validatedData.id} not found`),
        );
      }

      // Convert string dates to Date objects if provided
      let startDate: Date | undefined;
      let endDate: Date | null | undefined;
      let registrationDeadline: Date | null | undefined;

      if (validatedData.startDate !== undefined) {
        startDate = new Date(validatedData.startDate);
      }

      if (validatedData.endDate !== undefined) {
        endDate = validatedData.endDate ? new Date(validatedData.endDate) : null;
      }

      if (validatedData.registrationDeadline !== undefined) {
        registrationDeadline = validatedData.registrationDeadline
          ? new Date(validatedData.registrationDeadline)
          : null;
      }

      // Validate business rules with current and new values
      const effectiveStartDate = startDate || tournament.startDate;

      if (endDate !== undefined && endDate !== null && effectiveStartDate > endDate) {
        return Result.fail<Tournament>(new Error('End date must be after start date'));
      }

      if (
        registrationDeadline !== undefined &&
        registrationDeadline !== null &&
        registrationDeadline > effectiveStartDate
      ) {
        return Result.fail<Tournament>(
          new Error('Registration deadline must be before start date'),
        );
      }

      // Update tournament using domain method
      tournament.updateDetails(
        validatedData.name,
        validatedData.description,
        startDate,
        endDate,
        validatedData.format,
        validatedData.location,
        validatedData.maxParticipants,
        registrationDeadline,
        validatedData.category,
        validatedData.status,
      );

      // Update tournament in repository
      await this.tournamentRepository.update(tournament);

      return Result.ok<Tournament>(tournament);
    } catch (error) {
      return Result.fail<Tournament>(
        error instanceof Error ? error : new Error('Failed to update tournament'),
      );
    }
  }
}
