import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Statistic } from '../../../domain/statistic/statistic.entity';
import { IStatisticRepository } from '../../interfaces/repositories/statistic.repository';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';

// Define pagination schema
const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.enum(['winRate', 'matchesPlayed', 'matchesWon', 'totalPoints', 'averageScore']).optional().default('winRate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Input validation schema
const GetTournamentStatisticsInputSchema = z.object({
  tournamentId: z.string().uuid({
    message: 'Invalid tournament ID format'
  }),
  pagination: PaginationSchema.optional()
});

// Input type
export type GetTournamentStatisticsInput = z.infer<typeof GetTournamentStatisticsInputSchema>;

// Output type
export interface GetTournamentStatisticsOutput {
  statistics: Statistic[];
  summary: {
    topScorer: {
      playerId: string;
      playerName?: string;
      totalPoints: number;
    } | null;
    highestWinRate: {
      playerId: string;
      playerName?: string;
      winRate: number;
    } | null;
    mostMatchesPlayed: {
      playerId: string;
      playerName?: string;
      matchesPlayed: number;
    } | null;
    averageWinRate: number;
    totalMatchesPlayed: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Use case for getting tournament statistics for all participants
 */
export class GetTournamentStatisticsUseCase extends BaseUseCase<
  GetTournamentStatisticsInput,
  GetTournamentStatisticsOutput
> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly tournamentRepository: ITournamentRepository,
    private readonly playerRepository: IPlayerRepository
  ) {
    super();
  }

  protected async executeImpl(input: GetTournamentStatisticsInput): Promise<Result<GetTournamentStatisticsOutput>> {
    try {
      // Validate input
      let validatedData: GetTournamentStatisticsInput;
      try {
        validatedData = await GetTournamentStatisticsInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<GetTournamentStatisticsOutput>(
            new Error(validationError.errors[0].message)
          );
        }
        throw validationError;
      }

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(validatedData.tournamentId);
      if (!tournament) {
        return Result.fail<GetTournamentStatisticsOutput>(
          new Error('Tournament not found')
        );
      }

      // Set pagination defaults if not provided
      const pagination = validatedData.pagination || {
        page: 1,
        limit: 10,
        sortBy: 'winRate',
        sortOrder: 'desc'
      };

      // Get tournament participants
      const participants = await this.tournamentRepository.getParticipants(
        validatedData.tournamentId
      );

      if (participants.length === 0) {
        return Result.fail<GetTournamentStatisticsOutput>(
          new Error('No participants found in this tournament')
        );
      }

      // Collect player IDs from participants
      const playerIds = participants;

      // Get statistics for all players in this tournament
      const allStatistics: Statistic[] = [];

      for (const playerId of playerIds) {
        const statistic = await this.statisticRepository.findByPlayerId(playerId);
        if (statistic) {
          allStatistics.push(statistic);
        }
      }

      // Check if any statistics were found
      if (allStatistics.length === 0) {
        return Result.fail<GetTournamentStatisticsOutput>(
          new Error('No statistics found for tournament participants')
        );
      }

      // Sort statistics based on pagination parameters
      const sortedStatistics = this.sortStatistics(
        allStatistics,
        pagination.sortBy,
        pagination.sortOrder
      );

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const paginatedStatistics = sortedStatistics.slice(
        offset,
        offset + pagination.limit
      );

      // Calculate summary statistics
      const summary = this.calculateSummaryStats(allStatistics);

      // Enhance summary with player names
      await this.enhanceSummaryWithPlayerNames(summary);

      // Return results
      return Result.ok<GetTournamentStatisticsOutput>({
        statistics: paginatedStatistics,
        summary,
        pagination: {
          total: allStatistics.length,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(allStatistics.length / pagination.limit)
        }
      });
    } catch (error) {
      return Result.fail<GetTournamentStatisticsOutput>(
        error instanceof Error ? error : new Error('Failed to get tournament statistics')
      );
    }
  }

  /**
   * Sort statistics based on sort criteria
   */
  private sortStatistics(
    statistics: Statistic[],
    sortBy: string,
    sortOrder: string
  ): Statistic[] {
    return [...statistics].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'winRate':
          comparison = a.winRate - b.winRate;
          break;
        case 'matchesPlayed':
          comparison = a.matchesPlayed - b.matchesPlayed;
          break;
        case 'matchesWon':
          comparison = a.matchesWon - b.matchesWon;
          break;
        case 'totalPoints':
          comparison = a.totalPoints - b.totalPoints;
          break;
        case 'averageScore':
          comparison = a.averageScore - b.averageScore;
          break;
        default:
          comparison = a.winRate - b.winRate;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummaryStats(statistics: Statistic[]): GetTournamentStatisticsOutput['summary'] {
    // Initialize with null values
    let topScorer: { playerId: string; totalPoints: number } | null = null;
    let highestWinRate: { playerId: string; winRate: number } | null = null;
    let mostMatchesPlayed: { playerId: string; matchesPlayed: number } | null = null;
    
    // Calculate total matches and average win rate
    let totalMatchesPlayed = 0;
    let totalWinRate = 0;

    statistics.forEach(stat => {
      // Update top scorer if current stat has higher total points
      if (
        !topScorer || 
        stat.totalPoints > topScorer.totalPoints
      ) {
        topScorer = {
          playerId: stat.playerId,
          totalPoints: stat.totalPoints
        };
      }

      // Update highest win rate if current stat has higher win rate and played more than 0 matches
      if (
        stat.matchesPlayed > 0 &&
        (!highestWinRate || stat.winRate > highestWinRate.winRate)
      ) {
        highestWinRate = {
          playerId: stat.playerId,
          winRate: stat.winRate
        };
      }

      // Update most matches played if current stat has played more matches
      if (
        !mostMatchesPlayed || 
        stat.matchesPlayed > mostMatchesPlayed.matchesPlayed
      ) {
        mostMatchesPlayed = {
          playerId: stat.playerId,
          matchesPlayed: stat.matchesPlayed
        };
      }

      // Sum up for averages
      totalMatchesPlayed += stat.matchesPlayed;
      
      // Only add win rate to total if player has played matches
      if (stat.matchesPlayed > 0) {
        totalWinRate += stat.winRate;
      }
    });

    // Calculate average win rate (only for players who have played matches)
    const playersWithMatches = statistics.filter(s => s.matchesPlayed > 0).length;
    const averageWinRate = playersWithMatches > 0 
      ? totalWinRate / playersWithMatches 
      : 0;

    return {
      topScorer,
      highestWinRate,
      mostMatchesPlayed,
      averageWinRate,
      totalMatchesPlayed
    };
  }

  /**
   * Enhance summary statistics with player names
   */
  private async enhanceSummaryWithPlayerNames(summary: GetTournamentStatisticsOutput['summary']): Promise<void> {
    // Add player names to summary entries
    if (summary.topScorer) {
      const player = await this.playerRepository.findById(summary.topScorer.playerId);
      if (player) {
        summary.topScorer.playerName = player.avatarUrl || undefined;
      }
    }

    if (summary.highestWinRate) {
      const player = await this.playerRepository.findById(summary.highestWinRate.playerId);
      if (player) {
        summary.highestWinRate.playerName = player.avatarUrl || undefined;
      }
    }

    if (summary.mostMatchesPlayed) {
      const player = await this.playerRepository.findById(summary.mostMatchesPlayed.playerId);
      if (player) {
        summary.mostMatchesPlayed.playerName = player.avatarUrl || undefined;
      }
    }
  }
} 