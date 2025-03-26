import { Result } from '../utils/result';
import { Statistic } from '@prisma/client';
import { IStatisticService } from '../../../src/core/application/interfaces/statistic-service.interface';

export class MockStatisticService implements IStatisticService {
  private statistics: Statistic[] = [
    {
      id: 'test-statistic-id',
      userId: 'test-user-id',
      tournamentId: 'test-tournament-id',
      matchesPlayed: 10,
      wins: 7,
      losses: 3,
      points: 70,
      rank: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'extra-statistic-id',
      userId: 'test-user-id-2',
      tournamentId: 'test-tournament-id',
      matchesPlayed: 8,
      wins: 5,
      losses: 3,
      points: 50,
      rank: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async getStatistics(params: {
    userId?: string;
    tournamentId?: string;
    page?: number;
    limit?: number;
  }): Promise<Result<Statistic[]>> {
    let filteredStats = [...this.statistics];

    if (params.userId) {
      filteredStats = filteredStats.filter(stat => stat.userId === params.userId);
    }

    if (params.tournamentId) {
      filteredStats = filteredStats.filter(stat => stat.tournamentId === params.tournamentId);
    }

    return Result.ok(filteredStats);
  }

  async getStatisticById(id: string): Promise<Result<Statistic>> {
    const statistic = this.statistics.find(stat => stat.id === id);
    if (!statistic) {
      return Result.fail(new Error('Statistic not found'));
    }
    return Result.ok(statistic);
  }

  async createStatistic(data: {
    userId: string;
    tournamentId: string;
    matchesPlayed: number;
    wins: number;
    losses: number;
    points: number;
    rank: number;
  }): Promise<Result<Statistic>> {
    const newStatistic: Statistic = {
      id: `new-statistic-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.statistics.push(newStatistic);
    return Result.ok(newStatistic);
  }

  async updateStatistic(
    id: string,
    data: Partial<{
      matchesPlayed: number;
      wins: number;
      losses: number;
      points: number;
      rank: number;
    }>,
  ): Promise<Result<Statistic>> {
    const statistic = this.statistics.find(stat => stat.id === id);
    if (!statistic) {
      return Result.fail(new Error('Statistic not found'));
    }

    const updatedStatistic = {
      ...statistic,
      ...data,
      updatedAt: new Date(),
    };

    this.statistics = this.statistics.map(stat =>
      stat.id === id ? updatedStatistic : stat,
    );

    return Result.ok(updatedStatistic);
  }

  async deleteStatistic(id: string): Promise<Result<void>> {
    const statistic = this.statistics.find(stat => stat.id === id);
    if (!statistic) {
      return Result.fail(new Error('Statistic not found'));
    }

    this.statistics = this.statistics.filter(stat => stat.id !== id);
    return Result.ok();
  }

  async getStatisticsByUserId(userId: string): Promise<Result<Statistic[]>> {
    const userStats = this.statistics.filter(stat => stat.userId === userId);
    return Result.ok(userStats);
  }

  async getStatisticsByTournamentId(tournamentId: string): Promise<Result<Statistic[]>> {
    const tournamentStats = this.statistics.filter(stat => stat.tournamentId === tournamentId);
    return Result.ok(tournamentStats);
  }
} 