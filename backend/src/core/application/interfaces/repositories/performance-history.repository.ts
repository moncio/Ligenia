import { PerformanceHistory } from '@prisma/client';

export interface PerformanceHistoryFilter {
  userId?: string;
  year?: number;
  month?: number;
  limit?: number;
  offset?: number;
}

export interface PerformanceSummary {
  userId: string;
  year?: number;
  totalMatches: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  avgPointsPerMonth: number;
  bestMonth?: {
    month: number;
    wins: number;
    points: number;
  };
}

export interface PerformanceTrend {
  period: string; // Can be a month name or year
  matchesPlayed: number;
  wins: number;
  losses: number;
  points: number;
}

export interface IPerformanceHistoryRepository {
  create(
    data: Omit<PerformanceHistory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PerformanceHistory>;
  findById(id: string): Promise<PerformanceHistory | null>;
  findByUserId(userId: string, filter?: PerformanceHistoryFilter): Promise<PerformanceHistory[]>;
  update(id: string, data: Partial<PerformanceHistory>): Promise<PerformanceHistory>;
  delete(id: string): Promise<void>;
  findPerformanceSummary(userId: string, year?: number): Promise<PerformanceSummary>;
  findPerformanceTrends(userId: string, timeframe?: string): Promise<PerformanceTrend[]>;
}
