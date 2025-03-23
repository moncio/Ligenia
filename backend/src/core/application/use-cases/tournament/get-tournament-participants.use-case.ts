import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { ITournamentRepository, PaginationOptions } from '../../interfaces/repositories/tournament.repository';

// Schema for validation of get tournament participants input
const getTournamentParticipantsSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10)
});

// Input type inferred from the schema
export type GetTournamentParticipantsInput = z.infer<typeof getTournamentParticipantsSchema>;

// Output DTO for tournament participants
export interface GetTournamentParticipantsOutput {
  participants: string[];
  pagination: {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Use case for getting a paginated list of participants registered to a tournament
 */
export class GetTournamentParticipantsUseCase extends BaseUseCase<
  GetTournamentParticipantsInput,
  GetTournamentParticipantsOutput
> {
  constructor(private readonly tournamentRepository: ITournamentRepository) {
    super();
  }

  protected async executeImpl(
    input: GetTournamentParticipantsInput
  ): Promise<Result<GetTournamentParticipantsOutput>> {
    try {
      // Validate input
      const validationResult = getTournamentParticipantsSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(
          new Error(`Invalid input: ${validationResult.error.message}`)
        );
      }

      const { tournamentId, page, limit } = validationResult.data;

      // First check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(
          new Error(`Tournament with ID ${tournamentId} not found`)
        );
      }

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Get total count of participants
      const totalItems = await this.tournamentRepository.countParticipants(tournamentId);
      
      // Calculate total pages
      const totalPages = Math.ceil(totalItems / limit);

      // Get paginated participants
      const paginationOptions: PaginationOptions = {
        skip,
        limit
      };
      
      const participants = await this.tournamentRepository.getParticipants(
        tournamentId,
        paginationOptions
      );

      // Prepare response
      const response: GetTournamentParticipantsOutput = {
        participants,
        pagination: {
          totalItems,
          itemsPerPage: limit,
          currentPage: page,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      };

      return Result.ok(response);
    } catch (error) {
      return Result.fail(
        error instanceof Error 
          ? error 
          : new Error('Failed to get tournament participants')
      );
    }
  }
} 