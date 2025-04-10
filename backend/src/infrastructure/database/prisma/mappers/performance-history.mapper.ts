import { PerformanceHistory as PrismaPerformanceHistory } from '@prisma/client';

export class PerformanceHistoryMapper {
  /**
   * Maps a Prisma PerformanceHistory model directly as it is the domain entity
   * In this case, we're using the Prisma model as the domain entity
   */
  public static toDomain(prismaPerformanceHistory: PrismaPerformanceHistory): PrismaPerformanceHistory {
    return {
      ...prismaPerformanceHistory,
    };
  }

  /**
   * Maps a domain PerformanceHistory entity to a Prisma PerformanceHistory object for create/update
   */
  public static toPrisma(performanceHistory: PrismaPerformanceHistory): Partial<PrismaPerformanceHistory> {
    return {
      id: performanceHistory.id,
      userId: performanceHistory.userId,
      year: performanceHistory.year,
      month: performanceHistory.month,
      matchesPlayed: performanceHistory.matchesPlayed,
      wins: performanceHistory.wins,
      losses: performanceHistory.losses,
      points: performanceHistory.points,
      createdAt: performanceHistory.createdAt,
      updatedAt: performanceHistory.updatedAt,
    };
  }
} 