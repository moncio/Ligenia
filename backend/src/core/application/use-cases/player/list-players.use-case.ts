import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Player } from '../../../domain/player/player.entity';
import {
  IPlayerRepository,
  PaginationOptions,
  PlayerFilter,
} from '../../interfaces/repositories/player.repository';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';

// Input validation schema
const ListPlayersInputSchema = z.object({
  level: z
    .nativeEnum(PlayerLevel, {
      errorMap: () => ({ message: 'Invalid player level' }),
    })
    .optional(),
  country: z.string().min(2).optional(),
  searchTerm: z.string().optional(),
  skip: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().default(10),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Input type
export type ListPlayersInput = z.infer<typeof ListPlayersInputSchema>;

// Output type
export interface ListPlayersOutput {
  players: Player[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Use case for listing players with filters and pagination
 */
export class ListPlayersUseCase extends BaseUseCase<ListPlayersInput, ListPlayersOutput> {
  constructor(private readonly playerRepository: IPlayerRepository) {
    super();
  }

  protected async executeImpl(input: ListPlayersInput): Promise<Result<ListPlayersOutput>> {
    try {
      // Validate input first
      let validatedData: ListPlayersInput;
      try {
        validatedData = await ListPlayersInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<ListPlayersOutput>(new Error(validationError.errors[0].message));
        }
        throw validationError;
      }

      // Prepare filter
      const filter: PlayerFilter = {};
      if (validatedData.level) {
        filter.level = validatedData.level;
      }
      if (validatedData.country) {
        filter.country = validatedData.country;
      }
      if (validatedData.searchTerm) {
        filter.searchTerm = validatedData.searchTerm;
      }

      // Prepare pagination
      const pagination: PaginationOptions = {
        skip: validatedData.skip,
        limit: validatedData.limit,
      };

      // Add sorting if provided
      if (validatedData.sortField && validatedData.sortOrder) {
        pagination.sort = {
          field: validatedData.sortField,
          order: validatedData.sortOrder,
        };
      }

      // Get players
      const players = await this.playerRepository.findAll(filter, pagination);
      const total = await this.playerRepository.count(filter);

      return Result.ok<ListPlayersOutput>({
        players,
        total,
        skip: validatedData.skip,
        limit: validatedData.limit,
      });
    } catch (error) {
      return Result.fail<ListPlayersOutput>(
        error instanceof Error ? error : new Error('Failed to list players'),
      );
    }
  }
}
