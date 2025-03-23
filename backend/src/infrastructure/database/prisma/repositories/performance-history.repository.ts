import { PerformanceHistory, PrismaClient } from '@prisma/client';
import { 
  IPerformanceHistoryRepository, 
  PerformanceHistoryFilter, 
  PerformanceSummary, 
  PerformanceTrend 
} from '../../../../core/application/interfaces/repositories/performance-history.repository';
import { BaseRepository } from '../base-repository';
import { PerformanceHistoryMapper } from '../mappers/performance-history.mapper';
import { Result } from '../../../../shared/result';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class PerformanceHistoryRepository extends BaseRepository implements IPerformanceHistoryRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super();
  }

  async create(data: Omit<PerformanceHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceHistory> {
    const result = await this.executeOperation<PerformanceHistory>(async () => {
      // Check for existing record with same userId, year, month to handle the unique constraint
      const existingRecord = await this.prisma.performanceHistory.findFirst({
        where: {
          userId: data.userId,
          year: data.year,
          month: data.month,
        }
      });

      if (existingRecord) {
        // Update existing record instead of creating a new one
        return await this.prisma.performanceHistory.update({
          where: { id: existingRecord.id },
          data: {
            matchesPlayed: data.matchesPlayed,
            wins: data.wins,
            losses: data.losses,
            points: data.points,
          }
        });
      }

      // Create new performance history record
      return await this.prisma.performanceHistory.create({
        data: {
          id: uuidv4(),
          ...data,
        }
      });
    });

    if (result.isFailure) {
      throw result.getError();
    }

    return result.getValue();
  }

  async findById(id: string): Promise<PerformanceHistory | null> {
    const result = await this.executeOperation<PerformanceHistory | null>(async () => {
      const performance = await this.prisma.performanceHistory.findUnique({
        where: { id }
      });

      if (!performance) {
        return null;
      }

      return PerformanceHistoryMapper.toDomain(performance);
    });

    return result.isSuccess ? result.getValue() : null;
  }

  async findByUserId(userId: string, filter?: PerformanceHistoryFilter): Promise<PerformanceHistory[]> {
    const result = await this.executeOperation<PerformanceHistory[]>(async () => {
      const whereClause: any = { userId };

      if (filter?.year !== undefined) {
        whereClause.year = filter.year;
      }

      if (filter?.month !== undefined) {
        whereClause.month = filter.month;
      }

      const performances = await this.prisma.performanceHistory.findMany({
        where: whereClause,
        skip: filter?.offset,
        take: filter?.limit,
        orderBy: [
          { year: 'desc' },
          { month: 'desc' }
        ]
      });

      return performances.map(performance => PerformanceHistoryMapper.toDomain(performance));
    });

    return result.isSuccess ? result.getValue() : [];
  }

  async update(id: string, data: Partial<PerformanceHistory>): Promise<PerformanceHistory> {
    const result = await this.executeOperation<PerformanceHistory>(async () => {
      // Remove id, createdAt, and updatedAt from data to prevent overwriting
      const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data as any;

      const updatedPerformance = await this.prisma.performanceHistory.update({
        where: { id },
        data: updateData
      });

      return PerformanceHistoryMapper.toDomain(updatedPerformance);
    });

    if (result.isFailure) {
      throw result.getError();
    }

    return result.getValue();
  }

  async delete(id: string): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      await this.prisma.performanceHistory.delete({
        where: { id }
      });
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }

  async findPerformanceSummary(userId: string, year?: number): Promise<PerformanceSummary> {
    const result = await this.executeOperation<PerformanceSummary>(async () => {
      const whereClause: any = { userId };

      if (year !== undefined) {
        whereClause.year = year;
      }

      const performances = await this.prisma.performanceHistory.findMany({
        where: whereClause
      });

      if (performances.length === 0) {
        return {
          userId,
          year,
          totalMatches: 0,
          totalWins: 0,
          totalLosses: 0,
          winRate: 0,
          avgPointsPerMonth: 0
        };
      }

      const totalMatches = performances.reduce((sum, perf) => sum + perf.matchesPlayed, 0);
      const totalWins = performances.reduce((sum, perf) => sum + perf.wins, 0);
      const totalLosses = performances.reduce((sum, perf) => sum + perf.losses, 0);
      const winRate = totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0;

      // Calculate average points per month
      const monthlyPerformances = performances.filter(perf => perf.month !== null);
      const avgPointsPerMonth = monthlyPerformances.length > 0
        ? monthlyPerformances.reduce((sum, perf) => sum + perf.points, 0) / monthlyPerformances.length
        : 0;

      // Find best month
      let bestMonth = undefined;
      if (monthlyPerformances.length > 0) {
        const bestPerformance = monthlyPerformances.reduce(
          (best, current) => (current.points > best.points ? current : best),
          monthlyPerformances[0]
        );
        bestMonth = {
          month: bestPerformance.month!,
          wins: bestPerformance.wins,
          points: bestPerformance.points
        };
      }

      return {
        userId,
        year,
        totalMatches,
        totalWins,
        totalLosses,
        winRate,
        avgPointsPerMonth,
        bestMonth
      };
    });

    if (result.isFailure) {
      throw result.getError();
    }

    return result.getValue();
  }

  async findPerformanceTrends(userId: string, timeframe: string = 'monthly'): Promise<PerformanceTrend[]> {
    const result = await this.executeOperation<PerformanceTrend[]>(async () => {
      // Get performances for the user
      const performances = await this.prisma.performanceHistory.findMany({
        where: { userId },
        orderBy: [
          { year: 'asc' },
          { month: 'asc' }
        ]
      });

      if (performances.length === 0) {
        return [];
      }

      if (timeframe === 'yearly') {
        // Group by year
        const yearlyTrends: Record<number, PerformanceTrend> = {};
        
        for (const perf of performances) {
          if (!yearlyTrends[perf.year]) {
            yearlyTrends[perf.year] = {
              period: perf.year.toString(),
              matchesPlayed: 0,
              wins: 0,
              losses: 0,
              points: 0
            };
          }
          
          yearlyTrends[perf.year].matchesPlayed += perf.matchesPlayed;
          yearlyTrends[perf.year].wins += perf.wins;
          yearlyTrends[perf.year].losses += perf.losses;
          yearlyTrends[perf.year].points += perf.points;
        }
        
        return Object.values(yearlyTrends);
      } else {
        // Monthly or all (default to monthly)
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        return performances
          .filter(perf => perf.month !== null)
          .map(perf => {
            const monthName = monthNames[perf.month! - 1];
            const period = `${monthName} ${perf.year}`;
            
            return {
              period,
              matchesPlayed: perf.matchesPlayed,
              wins: perf.wins,
              losses: perf.losses,
              points: perf.points
            };
          });
      }
    });

    if (result.isFailure) {
      throw result.getError();
    }

    return result.getValue();
  }
} 