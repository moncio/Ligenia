import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Tournament, TournamentStatus, PlayerLevel } from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository, TournamentFilter } from '../../interfaces/repositories/tournament.repository';

// Schema for validation of list tournaments input
const listTournamentsSchema = z.object({
  // Pagination
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().min(1).max(100).default(10),
  
  // Filtering
  status: z.nativeEnum(TournamentStatus).optional(),
  category: z.nativeEnum(PlayerLevel).optional(),
  startDateFrom: z.string().optional().refine(val => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, { message: "startDateFrom must be a valid date string" }),
  startDateTo: z.string().optional().refine(val => {
    if (!val) return true;
    return !isNaN(Date.parse(val));
  }, { message: "startDateTo must be a valid date string" }),
  searchTerm: z.string().optional(),
  
  // Sorting
  sortBy: z.enum(['startDate']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// Input type inferred from the schema
export type ListTournamentsInput = z.infer<typeof listTournamentsSchema>;

// Output DTO for pagination metadata
export interface PaginationMetadata {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Output DTO for list tournaments result
export interface ListTournamentsOutput {
  tournaments: Tournament[];
  pagination: PaginationMetadata;
}

/**
 * Use case for listing tournaments with pagination, filtering, and sorting
 */
export class ListTournamentsUseCase extends BaseUseCase<
  ListTournamentsInput,
  ListTournamentsOutput
> {
  constructor(private readonly tournamentRepository: ITournamentRepository) {
    super();
  }

  protected async executeImpl(
    input: ListTournamentsInput
  ): Promise<Result<ListTournamentsOutput>> {
    try {
      // Validate input
      const validationResult = listTournamentsSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(
          new Error(`Invalid input: ${validationResult.error.message}`)
        );
      }

      const {
        page,
        limit,
        status,
        category,
        startDateFrom,
        startDateTo,
        searchTerm,
        sortBy,
        sortOrder
      } = validationResult.data;

      // Build filter object
      const filter: TournamentFilter = {};
      
      if (status) {
        filter.status = status;
      }
      
      if (category) {
        filter.category = category;
      }
      
      if (startDateFrom || startDateTo) {
        filter.dateRange = {};
        
        if (startDateFrom) {
          filter.dateRange.from = new Date(startDateFrom);
        }
        
        if (startDateTo) {
          filter.dateRange.to = new Date(startDateTo);
        }
      }
      
      if (searchTerm) {
        filter.searchTerm = searchTerm;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;
      
      // Add sorting
      const sort = {
        field: sortBy,
        order: sortOrder
      };

      // Get total count for pagination
      const totalItems = await this.tournamentRepository.count(filter);
      
      // Get filtered, sorted, and paginated tournaments
      const tournaments = await this.tournamentRepository.findAll(filter, {
        skip,
        limit,
        sort
      });

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
        tournaments,
        pagination
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error 
          ? error 
          : new Error('Failed to list tournaments')
      );
    }
  }
} 