import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { IMatchRepository, MatchFilter } from '../../interfaces/repositories/match.repository';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';

// Schema for validation of list tournament matches input
const listTournamentMatchesSchema = z.object({
  // Tournament ID (required)
  tournamentId: z.string().uuid({
    message: 'Invalid tournament ID format'
  }),
  
  // Pagination
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(10),
  
  // Filtering
  status: z.nativeEnum(MatchStatus).optional(),
  round: z.number().int().positive().optional()
});

// Input type inferred from the schema
export type ListTournamentMatchesInput = z.infer<typeof listTournamentMatchesSchema>;

// Output DTO for pagination metadata
export interface PaginationMetadata {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Output DTO for list tournament matches result
export interface ListTournamentMatchesOutput {
  matches: Match[];
  pagination: PaginationMetadata;
}

/**
 * Use case for listing tournament matches with pagination and filtering
 */
export class ListTournamentMatchesUseCase extends BaseUseCase<
  ListTournamentMatchesInput,
  ListTournamentMatchesOutput
> {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly tournamentRepository: ITournamentRepository
  ) {
    super();
  }

  protected async executeImpl(
    input: ListTournamentMatchesInput
  ): Promise<Result<ListTournamentMatchesOutput>> {
    try {
      // Validate input
      const validationResult = listTournamentMatchesSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(
          new Error(`Invalid input: ${validationResult.error.errors[0].message}`)
        );
      }

      const { tournamentId, page, limit, status, round } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(new Error('Tournament not found'));
      }

      // Build filter object
      const filter: MatchFilter = {
        tournamentId
      };
      
      if (status !== undefined) {
        filter.status = status;
      }
      
      if (round !== undefined) {
        filter.round = round;
      }

      // Calculate pagination
      const offset = (page - 1) * limit;
      filter.limit = limit;
      filter.offset = offset;

      // Get matches with filter applied
      const matches = await this.matchRepository.findByFilter(filter);

      // Count total matches for pagination
      // Since MatchRepository doesn't have a dedicated count method, 
      // we need to get all matches without pagination and count them
      const countFilter: MatchFilter = { ...filter };
      delete countFilter.limit;
      delete countFilter.offset;
      const allMatches = await this.matchRepository.findByFilter(countFilter);
      const totalItems = allMatches.length;

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalItems / limit);
      const pagination: PaginationMetadata = {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      };

      return Result.ok({
        matches,
        pagination
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error 
          ? error 
          : new Error('Failed to list tournament matches')
      );
    }
  }
} 