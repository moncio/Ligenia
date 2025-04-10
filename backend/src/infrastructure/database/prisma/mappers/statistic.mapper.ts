import { Statistic as PrismaStatistic } from '@prisma/client';
import { Statistic } from '../../../../core/domain/statistic/statistic.entity';

export class StatisticMapper {
  /**
   * Maps a Prisma Statistic model to a domain Statistic entity
   */
  public static toDomain(prismaStatistic: PrismaStatistic): Statistic {
    // Calculate derived values from Prisma model
    const matchesPlayed = prismaStatistic.matchesPlayed;
    const matchesWon = prismaStatistic.wins;
    const matchesLost = prismaStatistic.losses;
    const totalPoints = prismaStatistic.points;
    
    // Calculate average score and win rate
    const averageScore = matchesPlayed > 0 ? totalPoints / matchesPlayed : 0;
    const winRate = matchesPlayed > 0 ? (matchesWon / matchesPlayed) * 100 : 0;
    
    return new Statistic(
      prismaStatistic.id,
      prismaStatistic.userId, // Using userId instead of playerId in Prisma
      matchesPlayed,
      matchesWon,
      matchesLost,
      totalPoints,
      averageScore,
      0, // tournamentsPlayed - not stored in Prisma model, would need separate query
      0, // tournamentsWon - not stored in Prisma model, would need separate query
      winRate,
      prismaStatistic.updatedAt, // Using updatedAt as lastUpdated
      prismaStatistic.createdAt,
      prismaStatistic.updatedAt,
    );
  }

  /**
   * Maps a domain Statistic entity to a Prisma Statistic object for create/update
   */
  public static toPrisma(statistic: Statistic, tournamentId: string): Partial<PrismaStatistic> {
    return {
      id: statistic.id,
      userId: statistic.playerId, // Using playerId as userId in Prisma
      tournamentId: tournamentId, // Required in Prisma model
      matchesPlayed: statistic.matchesPlayed,
      wins: statistic.matchesWon,
      losses: statistic.matchesLost,
      points: statistic.totalPoints,
      rank: 0, // Default rank
      createdAt: statistic.createdAt,
      updatedAt: statistic.updatedAt,
    };
  }
} 