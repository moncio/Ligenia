import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { MatchStatus } from '../../../domain/match/match.entity';
import { TournamentStatus } from '../../../domain/tournament/tournament.entity';

// Define input validation schema using Zod
const getTournamentStandingsSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
  page: z.number().int().positive().default(1).optional(),
  limit: z.number().int().positive().max(100).default(10).optional(),
});

// Define the input type using the Zod schema
export type GetTournamentStandingsInput = z.infer<typeof getTournamentStandingsSchema>;

// Define a player standing interface
export interface PlayerStanding {
  playerId: string;
  playerName: string;
  position: number;
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
}

// Define the output interface
export interface GetTournamentStandingsOutput {
  tournamentId: string;
  tournamentName: string;
  tournamentStatus: TournamentStatus;
  standings: PlayerStanding[];
  pagination: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

/**
 * Use case to get tournament standings based on match results
 */
export class GetTournamentStandingsUseCase extends BaseUseCase<
  GetTournamentStandingsInput,
  GetTournamentStandingsOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly matchRepository: IMatchRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: GetTournamentStandingsInput,
  ): Promise<Result<GetTournamentStandingsOutput>> {
    try {
      // Validate input
      const validationResult = getTournamentStandingsSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(new Error(`Invalid input: ${validationResult.error.message}`));
      }

      const { tournamentId, page = 1, limit = 10 } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(new Error(`Tournament with ID ${tournamentId} not found`));
      }

      // Get all matches for the tournament
      const allMatches = await this.matchRepository.findByFilter({ tournamentId });
      
      // Get completed matches for calculating standings
      const completedMatches = allMatches.filter(match => match.status === MatchStatus.COMPLETED);
      
      // Build standings from completed matches
      const standingsMap = new Map<string, PlayerStanding>();
      
      // Process each match to calculate player standings
      for (const match of completedMatches) {
        // Skip matches with no scores (should not happen for completed matches)
        if (match.homeScore === null || match.awayScore === null) {
          continue;
        }

        // Process home player
        if (!standingsMap.has(match.homePlayerOneId)) {
          standingsMap.set(match.homePlayerOneId, {
            playerId: match.homePlayerOneId,
            playerName: match.homePlayerOneId, // Ideally would be replaced with actual name
            position: 0, // Will be calculated later
            points: 0,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
          });
        }
        
        // Process away player
        if (!standingsMap.has(match.awayPlayerOneId)) {
          standingsMap.set(match.awayPlayerOneId, {
            playerId: match.awayPlayerOneId,
            playerName: match.awayPlayerOneId, // Ideally would be replaced with actual name
            position: 0, // Will be calculated later
            points: 0,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
          });
        }
        
        // Update home player stats
        const homePlayer = standingsMap.get(match.homePlayerOneId)!;
        homePlayer.matchesPlayed += 1;
        if (match.homeScore > match.awayScore) {
          homePlayer.wins += 1;
          homePlayer.points += 3; // 3 points for a win
        } else {
          homePlayer.losses += 1;
        }
        
        // Update away player stats
        const awayPlayer = standingsMap.get(match.awayPlayerOneId)!;
        awayPlayer.matchesPlayed += 1;
        if (match.awayScore > match.homeScore) {
          awayPlayer.wins += 1;
          awayPlayer.points += 3; // 3 points for a win
        } else {
          awayPlayer.losses += 1;
        }
      }
      
      // Convert map to array and sort by points (descending)
      let standings = Array.from(standingsMap.values()).sort((a, b) => {
        // Sort by points (descending)
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        // If points are equal, sort by win/loss ratio
        const aRatio = a.wins / (a.wins + a.losses || 1);
        const bRatio = b.wins / (b.wins + b.losses || 1);
        return bRatio - aRatio;
      });
      
      // Assign positions based on the sorted order
      standings.forEach((standing, index) => {
        standing.position = index + 1;
      });
      
      // Apply pagination
      const totalItems = standings.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      standings = standings.slice(startIndex, endIndex);
      
      return Result.ok({
        tournamentId,
        tournamentName: tournament.name,
        tournamentStatus: tournament.status,
        standings,
        pagination: {
          totalItems,
          currentPage: page,
          itemsPerPage: limit,
          totalPages,
        },
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error
          ? error
          : new Error('Failed to get tournament standings'),
      );
    }
  }
} 