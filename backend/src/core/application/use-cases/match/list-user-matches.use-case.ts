import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { IMatchRepository, MatchFilter } from '../../interfaces/repositories/match.repository';
import { IUserRepository } from '../../interfaces/repositories/user.repository';

// Enum for match results
export enum MatchResult {
  WIN = 'WIN',
  LOSS = 'LOSS',
}

// Schema for validation of list user matches input
const listUserMatchesSchema = z.object({
  // User ID (required)
  userId: z.string().uuid({
    message: 'Invalid user ID format',
  }),

  // Pagination
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(10),

  // Filtering
  tournamentId: z
    .string()
    .uuid({
      message: 'Invalid tournament ID format',
    })
    .optional(),

  result: z
    .nativeEnum(MatchResult, {
      errorMap: () => ({ message: 'Result must be WIN or LOSS' }),
    })
    .optional(),

  dateRange: z
    .object({
      from: z
        .string()
        .refine(val => !isNaN(Date.parse(val)), {
          message: 'Invalid from date format',
        })
        .optional(),
      to: z
        .string()
        .refine(val => !isNaN(Date.parse(val)), {
          message: 'Invalid to date format',
        })
        .optional(),
    })
    .optional(),
});

// Input type inferred from the schema
export type ListUserMatchesInput = z.infer<typeof listUserMatchesSchema>;

// Output DTO for pagination metadata
export interface PaginationMetadata {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Output DTO for list user matches result
export interface ListUserMatchesOutput {
  matches: Match[];
  pagination: PaginationMetadata;
}

/**
 * Use case for listing user matches with pagination and filtering
 */
export class ListUserMatchesUseCase extends BaseUseCase<
  ListUserMatchesInput,
  ListUserMatchesOutput
> {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  protected async executeImpl(input: ListUserMatchesInput): Promise<Result<ListUserMatchesOutput>> {
    try {
      // Validate input
      const validationResult = listUserMatchesSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(new Error(`Invalid input: ${validationResult.error.errors[0].message}`));
      }

      const { userId, page, limit, tournamentId, result, dateRange } = validationResult.data;

      // Check if user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return Result.fail(new Error('User not found'));
      }

      // Build filter object
      const filter: MatchFilter = {
        userId,
      };

      if (tournamentId) {
        filter.tournamentId = tournamentId;
      }

      // Process date range if provided
      if (dateRange) {
        if (dateRange.from) {
          filter.fromDate = new Date(dateRange.from);
        }
        if (dateRange.to) {
          filter.toDate = new Date(dateRange.to);
        }
      }

      // Calculate pagination
      const offset = (page - 1) * limit;
      filter.limit = limit;
      filter.offset = offset;

      // Get all matches for the user to apply result filtering and for total count
      const allUserMatches = await this.matchRepository.findByPlayerId(userId);

      // Apply result filter if specified
      let filteredMatches = allUserMatches;

      if (result) {
        filteredMatches = allUserMatches.filter(match => {
          if (match.status !== MatchStatus.COMPLETED) {
            return false;
          }

          const winnerIds = match.getWinnerIds();
          if (!winnerIds) {
            return false;
          }

          const userIsWinner = winnerIds.includes(userId);

          return (
            (result === MatchResult.WIN && userIsWinner) ||
            (result === MatchResult.LOSS && !userIsWinner)
          );
        });
      }

      // Apply tournament filter if specified
      if (tournamentId) {
        filteredMatches = filteredMatches.filter(match => match.tournamentId === tournamentId);
      }

      // Apply date range filter if specified
      if (dateRange) {
        if (dateRange.from) {
          const fromDate = new Date(dateRange.from);
          filteredMatches = filteredMatches.filter(
            match => match.date !== null && match.date >= fromDate,
          );
        }

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          filteredMatches = filteredMatches.filter(
            match => match.date !== null && match.date <= toDate,
          );
        }
      }

      // Get total count for pagination
      const totalItems = filteredMatches.length;

      // Apply pagination to filtered matches
      const paginatedMatches = filteredMatches.slice(offset, offset + limit);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalItems / limit) || 1;
      const pagination: PaginationMetadata = {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };

      return Result.ok({
        matches: paginatedMatches,
        pagination,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to list user matches'));
    }
  }
}
