import { Statistic } from '@prisma/client';
import { Result } from '../../../shared/result';

export interface IStatisticService {
  getStatistics(params: {
    userId?: string;
    tournamentId?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<Statistic[]>>;

  getStatisticById(id: string): Promise<Result<Statistic>>;

  createStatistic(data: {
    userId: string;
    tournamentId: string;
    matchesPlayed: number;
    wins: number;
    losses: number;
    points: number;
    rank: number;
  }): Promise<Result<Statistic>>;

  updateStatistic(
    id: string,
    data: Partial<{
      matchesPlayed: number;
      wins: number;
      losses: number;
      points: number;
      rank: number;
    }>,
  ): Promise<Result<Statistic>>;

  deleteStatistic(id: string): Promise<Result<void>>;

  getStatisticsByUserId(userId: string): Promise<Result<Statistic[]>>;

  getStatisticsByTournamentId(tournamentId: string): Promise<Result<Statistic[]>>;
} 