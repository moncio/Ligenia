import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Statistic } from '../../../domain/statistic/statistic.entity';
import { IStatisticRepository } from '../../interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';

// Define pagination schema
const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z
    .enum(['winRate', 'matchesPlayed', 'matchesWon', 'totalPoints', 'averageScore'])
    .optional()
    .default('totalPoints'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Input validation schema
const ListGlobalStatisticsInputSchema = z.object({
  playerLevel: z
    .enum([PlayerLevel.P1, PlayerLevel.P2, PlayerLevel.P3])
    .optional(),
  pagination: PaginationSchema.optional(),
});

// Input type
export type ListGlobalStatisticsInput = z.infer<typeof ListGlobalStatisticsInputSchema>;

// Statistics with enhanced data
export interface EnhancedStatistic
  extends Omit<Statistic, 'updateAfterMatch' | 'updateAfterTournament' | 'reset'> {
  playerName?: string;
  playerAvatarUrl?: string;
  playerLevel?: PlayerLevel;
  rank: number;
  updateAfterMatch(won: boolean, score: number): void;
  updateAfterTournament(won: boolean): void;
  reset(): void;
}

// Output type
export interface ListGlobalStatisticsOutput {
  statistics: EnhancedStatistic[];
  summary: {
    topScorer: {
      playerId: string;
      playerName?: string;
      totalPoints: number;
      rank: number;
    } | null;
    highestWinRate: {
      playerId: string;
      playerName?: string;
      winRate: number;
      rank: number;
    } | null;
    mostMatchesPlayed: {
      playerId: string;
      playerName?: string;
      matchesPlayed: number;
      rank: number;
    } | null;
    totalPlayers: number;
    totalMatchesPlayed: number;
    averageWinRate: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Use case for listing global statistics for all players
 */
export class ListGlobalStatisticsUseCase extends BaseUseCase<
  ListGlobalStatisticsInput,
  ListGlobalStatisticsOutput
> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly playerRepository: IPlayerRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: ListGlobalStatisticsInput,
  ): Promise<Result<ListGlobalStatisticsOutput>> {
    try {
      // Validate input
      let validatedData: ListGlobalStatisticsInput;
      try {
        validatedData = await ListGlobalStatisticsInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<ListGlobalStatisticsOutput>(
            new Error(validationError.errors[0].message),
          );
        }
        throw validationError;
      }

      // Set pagination defaults if not provided
      const pagination = validatedData.pagination || {
        page: 1,
        limit: 10,
        sortBy: 'totalPoints',
        sortOrder: 'desc',
      };

      // Get all statistics
      const allStatistics = await this.statisticRepository.findAll();

      if (allStatistics.length === 0) {
        return Result.fail<ListGlobalStatisticsOutput>(new Error('No statistics found'));
      }

      // Get all players for enhancing statistics
      const allPlayers = await this.playerRepository.findAll();

      // Filter by player level if specified
      let filteredStatistics = allStatistics;

      if (validatedData.playerLevel) {
        const playersWithLevel = allPlayers.filter(
          player => player.level === validatedData.playerLevel,
        );

        const playerIds = playersWithLevel.map(player => player.id);

        filteredStatistics = allStatistics.filter(stat => playerIds.includes(stat.playerId));

        if (filteredStatistics.length === 0) {
          return Result.fail<ListGlobalStatisticsOutput>(
            new Error(`No statistics found for players with level ${validatedData.playerLevel}`),
          );
        }
      }

      // Sort and rank statistics
      const { rankedStatistics, sortCriteria } = this.rankStatistics(
        filteredStatistics,
        pagination.sortBy,
        pagination.sortOrder,
      );

      // Enhance statistics with player data
      const enhancedStatistics = this.enhanceStatisticsWithPlayerData(rankedStatistics, allPlayers);

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const paginatedStatistics = enhancedStatistics.slice(offset, offset + pagination.limit);

      // Calculate summary statistics
      const summary = this.calculateSummaryStats(enhancedStatistics, sortCriteria);

      // Return results
      return Result.ok<ListGlobalStatisticsOutput>({
        statistics: paginatedStatistics,
        summary,
        pagination: {
          total: enhancedStatistics.length,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(enhancedStatistics.length / pagination.limit),
        },
      });
    } catch (error) {
      return Result.fail<ListGlobalStatisticsOutput>(
        error instanceof Error ? error : new Error('Failed to list global statistics'),
      );
    }
  }

  /**
   * Rank statistics based on sort criteria
   */
  private rankStatistics(
    statistics: Statistic[],
    sortBy: string,
    sortOrder: string,
  ): { rankedStatistics: Statistic[]; sortCriteria: string } {
    // Create a copy of statistics to sort
    const sortedStatistics = [...statistics];

    // Sort based on the specified criteria
    sortedStatistics.sort((a, b) => {
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
          comparison = a.totalPoints - b.totalPoints;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return {
      rankedStatistics: sortedStatistics,
      sortCriteria: sortBy,
    };
  }

  /**
   * Enhance statistics with player data and rank
   */
  private enhanceStatisticsWithPlayerData(
    statistics: Statistic[],
    players: any[],
  ): EnhancedStatistic[] {
    return statistics.map((stat, index) => {
      const player = players.find(p => p.id === stat.playerId);

      // Create a new object with all Statistic properties plus our enhanced ones
      const enhancedStat: EnhancedStatistic = {
        ...stat,
        playerName: player?.avatarUrl || undefined,
        playerAvatarUrl: player?.avatarUrl || undefined,
        playerLevel: player?.level || undefined,
        rank: index + 1, // 1-based ranking
        updateAfterMatch: stat.updateAfterMatch.bind(stat),
        updateAfterTournament: stat.updateAfterTournament.bind(stat),
        reset: stat.reset.bind(stat),
      };

      return enhancedStat;
    });
  }

  /**
   * Calculate summary statistics
   */
  private calculateSummaryStats(
    statistics: EnhancedStatistic[],
    sortCriteria: string,
  ): ListGlobalStatisticsOutput['summary'] {
    // Initialize with null values
    let topScorer: {
      playerId: string;
      playerName?: string;
      totalPoints: number;
      rank: number;
    } | null = null;

    let highestWinRate: {
      playerId: string;
      playerName?: string;
      winRate: number;
      rank: number;
    } | null = null;

    let mostMatchesPlayed: {
      playerId: string;
      playerName?: string;
      matchesPlayed: number;
      rank: number;
    } | null = null;

    // Calculate total matches and average win rate
    let totalMatchesPlayed = 0;
    let totalWinRate = 0;
    let playersWithMatches = 0;

    // Find top statistics
    statistics.forEach(stat => {
      // Update total matches and win rate
      totalMatchesPlayed += stat.matchesPlayed;

      if (stat.matchesPlayed > 0) {
        totalWinRate += stat.winRate;
        playersWithMatches++;
      }

      // Find top scorer if not already set or if higher
      if (!topScorer || stat.totalPoints > topScorer.totalPoints) {
        topScorer = {
          playerId: stat.playerId,
          playerName: stat.playerName,
          totalPoints: stat.totalPoints,
          rank: stat.rank,
        };
      }

      // Find highest win rate if not already set or if higher
      if (stat.matchesPlayed > 0 && (!highestWinRate || stat.winRate > highestWinRate.winRate)) {
        highestWinRate = {
          playerId: stat.playerId,
          playerName: stat.playerName,
          winRate: stat.winRate,
          rank: stat.rank,
        };
      }

      // Find most matches played if not already set or if higher
      if (!mostMatchesPlayed || stat.matchesPlayed > mostMatchesPlayed.matchesPlayed) {
        mostMatchesPlayed = {
          playerId: stat.playerId,
          playerName: stat.playerName,
          matchesPlayed: stat.matchesPlayed,
          rank: stat.rank,
        };
      }
    });

    // Calculate average win rate
    const averageWinRate = playersWithMatches > 0 ? totalWinRate / playersWithMatches : 0;

    return {
      topScorer,
      highestWinRate,
      mostMatchesPlayed,
      totalPlayers: statistics.length,
      totalMatchesPlayed,
      averageWinRate,
    };
  }
}
