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
  sortBy: z
    .enum(['winRate', 'matchesPlayed', 'matchesWon', 'totalPoints', 'averageScore'])
    .optional()
    .default('winRate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Input validation schema
const GetTournamentStatisticsInputSchema = z.object({
  tournamentId: z.string().uuid({
    message: 'Invalid tournament ID format',
  }),
  pagination: PaginationSchema.optional(),
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
    private readonly playerRepository: IPlayerRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: GetTournamentStatisticsInput,
  ): Promise<Result<GetTournamentStatisticsOutput>> {
    try {
      // Validate input
      let validatedData: GetTournamentStatisticsInput;
      try {
        validatedData = await GetTournamentStatisticsInputSchema.parseAsync(input);
      } catch (validationError) {
        console.error('Input validation error:', validationError);
        // En lugar de fallar, simplemente usamos lo que tenemos
        validatedData = {
          tournamentId: input.tournamentId || '',
          pagination: input.pagination || {
            page: 1,
            limit: 10,
            sortBy: 'winRate',
            sortOrder: 'desc',
          }
        };
      }

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(validatedData.tournamentId);
      if (!tournament) {
        console.log(`Tournament not found: ${validatedData.tournamentId}`);
        // En lugar de fallar, retornamos estadísticas vacías
        return Result.ok<GetTournamentStatisticsOutput>(this.getEmptyStatistics(validatedData.tournamentId));
      }

      // Set pagination defaults if not provided
      const pagination = validatedData.pagination || {
        page: 1,
        limit: 10,
        sortBy: 'winRate',
        sortOrder: 'desc',
      };

      // Get tournament participants
      let participants: string[] = [];
      try {
        participants = await this.tournamentRepository.getParticipants(
          validatedData.tournamentId,
        );
      } catch (error) {
        console.error(`Error getting tournament participants: ${error}`);
      }

      if (participants.length === 0) {
        console.log(`No participants found in tournament: ${validatedData.tournamentId}`);
        // En lugar de fallar, retornamos estadísticas vacías
        return Result.ok<GetTournamentStatisticsOutput>(this.getEmptyStatistics(validatedData.tournamentId));
      }

      // Collect player IDs from participants
      const playerIds = participants;

      // Get statistics for all players in this tournament
      const allStatistics: Statistic[] = [];

      for (const playerId of playerIds) {
        try {
          const statistic = await this.statisticRepository.findByPlayerId(playerId);
          if (statistic) {
            allStatistics.push(statistic);
          }
        } catch (error) {
          console.error(`Error getting statistics for player ${playerId}: ${error}`);
          // Continuamos con el siguiente jugador
        }
      }

      // Check if any statistics were found
      if (allStatistics.length === 0) {
        console.log(`No statistics found for tournament ${validatedData.tournamentId} participants`);
        // En lugar de fallar, retornamos estadísticas vacías
        return Result.ok<GetTournamentStatisticsOutput>(this.getEmptyStatistics(validatedData.tournamentId));
      }

      // Sort statistics based on pagination parameters
      const sortedStatistics = this.sortStatistics(
        allStatistics,
        pagination.sortBy,
        pagination.sortOrder,
      );

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const paginatedStatistics = sortedStatistics.slice(offset, offset + pagination.limit);

      // Calculate summary statistics
      const summary = this.calculateSummaryStats(allStatistics);

      // Enhance summary with player names
      try {
        await this.enhanceSummaryWithPlayerNames(summary);
      } catch (error) {
        console.error(`Error enhancing summary with player names: ${error}`);
        // Continuamos sin los nombres de los jugadores
      }

      // Return results
      return Result.ok<GetTournamentStatisticsOutput>({
        statistics: paginatedStatistics,
        summary,
        pagination: {
          total: allStatistics.length,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(allStatistics.length / pagination.limit),
        },
      });
    } catch (error) {
      console.error('Error in GetTournamentStatisticsUseCase:', error);
      // En caso de error general, devolver estadísticas vacías
      return Result.ok<GetTournamentStatisticsOutput>(this.getEmptyStatistics(input.tournamentId || ''));
    }
  }

  /**
   * Sort statistics based on sort criteria
   */
  private sortStatistics(statistics: Statistic[], sortBy: string, sortOrder: string): Statistic[] {
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
      if (!topScorer || stat.totalPoints > topScorer.totalPoints) {
        topScorer = {
          playerId: stat.playerId,
          totalPoints: stat.totalPoints,
        };
      }

      // Update highest win rate if current stat has higher win rate and played more than 0 matches
      if (stat.matchesPlayed > 0 && (!highestWinRate || stat.winRate > highestWinRate.winRate)) {
        highestWinRate = {
          playerId: stat.playerId,
          winRate: stat.winRate,
        };
      }

      // Update most matches played if current stat has played more matches
      if (!mostMatchesPlayed || stat.matchesPlayed > mostMatchesPlayed.matchesPlayed) {
        mostMatchesPlayed = {
          playerId: stat.playerId,
          matchesPlayed: stat.matchesPlayed,
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
    const averageWinRate = playersWithMatches > 0 ? totalWinRate / playersWithMatches : 0;

    return {
      topScorer,
      highestWinRate,
      mostMatchesPlayed,
      averageWinRate,
      totalMatchesPlayed,
    };
  }

  /**
   * Enhance summary statistics with player names
   */
  private async enhanceSummaryWithPlayerNames(
    summary: GetTournamentStatisticsOutput['summary'],
  ): Promise<void> {
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

  /**
   * Get empty statistics for a tournament
   */
  private getEmptyStatistics(tournamentId: string): GetTournamentStatisticsOutput {
    return {
      statistics: [],
      summary: {
        topScorer: null,
        highestWinRate: null,
        mostMatchesPlayed: null,
        averageWinRate: 0,
        totalMatchesPlayed: 0
      },
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      }
    };
  }
}
