import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import {
  Tournament,
  TournamentStatus,
  PlayerLevel,
} from '../../../domain/tournament/tournament.entity';
import {
  ITournamentRepository,
  PaginationOptions,
  DateRangeFilter,
  TournamentFilter,
} from '../../interfaces/repositories/tournament.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';

// Input validation schema
export const GetPlayerTournamentsInputSchema = z.object({
  playerId: z.string().uuid({ message: 'Invalid player ID format' }),
  status: z.nativeEnum(TournamentStatus).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  category: z.nativeEnum(PlayerLevel).nullable().optional(),
  skip: z.number().int().min(0).default(0),
  limit: z.number().int().min(1).max(100).default(10),
  sortField: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Input type
export type GetPlayerTournamentsInput = z.infer<typeof GetPlayerTournamentsInputSchema>;

// Output type
export interface GetPlayerTournamentsOutput {
  tournaments: Tournament[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Use case for getting tournaments a player is registered for
 */
export class GetPlayerTournamentsUseCase extends BaseUseCase<
  GetPlayerTournamentsInput,
  GetPlayerTournamentsOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly playerRepository: IPlayerRepository,
  ) {
    super();
  }

  // Main execution method
  protected async executeImpl(
    input: GetPlayerTournamentsInput,
  ): Promise<Result<GetPlayerTournamentsOutput>> {
    console.log('Input to GetPlayerTournamentsUseCase:', input);

    try {
      // Input validation
      try {
        await GetPlayerTournamentsInputSchema.parseAsync(input);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const validationErrors = error.errors
            .map(err => `${err.path}: ${err.message}`)
            .join(', ');
          return Result.fail(new Error(`Invalid input: ${validationErrors}`));
        }
        throw error;
      }

      // Find player
      const player = await this.playerRepository.findById(input.playerId);
      console.log('Player found:', player);

      if (!player) {
        return Result.fail(new Error('Player not found'));
      }

      // Get all tournaments
      const allTournaments = await this.tournamentRepository.findAll();
      console.log('All tournaments count:', allTournaments.length);

      // Filter tournaments to only those where the player is registered
      let playerTournaments: Tournament[] = [];

      for (const tournament of allTournaments) {
        console.log(`Checking registration for tournament: ${tournament.id} ${tournament.name}`);
        const isRegistered = await this.tournamentRepository.isParticipantRegistered(
          tournament.id,
          player.id,
        );
        console.log('Is player registered:', isRegistered);

        if (isRegistered) {
          playerTournaments.push(tournament);
        }
      }

      console.log('Player tournaments after checking registrations:', playerTournaments.length);
      console.log(
        'Player tournaments IDs:',
        playerTournaments.map(t => t.id),
      );

      // Now apply the filters to the player's tournaments
      if (input.status !== undefined) {
        console.log('Filtering by status:', input.status);
        playerTournaments = playerTournaments.filter(t => t.status === input.status);
        console.log('After status filter:', playerTournaments.length);
      }

      if (input.category !== undefined) {
        console.log('Filtering by category:', input.category);
        if (input.category === null) {
          playerTournaments = playerTournaments.filter(t => t.category === null);
        } else {
          playerTournaments = playerTournaments.filter(t => t.category === input.category);
        }
        console.log('After category filter:', playerTournaments.length);
      }

      if (input.fromDate) {
        console.log('Filtering by fromDate:', input.fromDate);
        playerTournaments = playerTournaments.filter(t => t.startDate >= input.fromDate);
        console.log('After fromDate filter:', playerTournaments.length);
      }

      if (input.toDate) {
        console.log('Filtering by toDate:', input.toDate);
        playerTournaments = playerTournaments.filter(t => t.startDate <= input.toDate);
        console.log('After toDate filter:', playerTournaments.length);
      }

      // Get the total count before pagination
      const total = playerTournaments.length;
      console.log('Total before pagination:', total);

      // Sort tournaments if needed
      if (input.sortField && input.sortOrder) {
        const { sortField, sortOrder } = input;
        console.log(`Sorting by ${sortField} in ${sortOrder} order`);

        playerTournaments.sort((a: any, b: any) => {
          if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
          if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      const skip = input.skip || 0;
      const limit = input.limit || 10;

      const paginatedTournaments = playerTournaments.slice(skip, skip + limit);
      console.log('After pagination:', paginatedTournaments.length);

      return Result.ok({
        tournaments: paginatedTournaments,
        total,
        skip,
        limit,
      });
    } catch (error) {
      return Result.fail(error as Error);
    }
  }
}
