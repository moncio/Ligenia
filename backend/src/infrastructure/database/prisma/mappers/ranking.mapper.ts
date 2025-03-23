import { Player, Statistic, User } from '@prisma/client';
import { Ranking } from '../../../../core/domain/ranking/ranking.entity';
import { PlayerLevel } from '../../../../core/domain/tournament/tournament.entity';

/**
 * Type representing combined data needed to create a Ranking entity
 */
export type RankingData = {
  id: string;
  playerId: string;
  rankingPoints: number;
  globalPosition: number;
  categoryPosition: number;
  playerLevel: string;
  previousPosition?: number | null;
  positionChange?: number;
  lastCalculated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export class RankingMapper {
  /**
   * Maps data from Prisma to a domain Ranking entity
   */
  public static toDomain(data: RankingData): Ranking {
    return new Ranking(
      data.id,
      data.playerId,
      data.rankingPoints,
      data.globalPosition,
      data.categoryPosition,
      data.playerLevel,
      data.previousPosition ?? null,
      data.positionChange ?? 0,
      data.lastCalculated ?? new Date(),
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date()
    );
  }

  /**
   * Creates a ranking data object from Statistic, Player and position information
   */
  public static createRankingData(
    id: string,
    statistic: Statistic,
    player: Player,
    globalPosition: number,
    categoryPosition: number,
    previousPosition?: number
  ): RankingData {
    const now = new Date();
    return {
      id,
      playerId: player.userId,
      rankingPoints: statistic.points,
      globalPosition,
      categoryPosition,
      playerLevel: player.level,
      previousPosition: previousPosition ?? null,
      positionChange: previousPosition ? previousPosition - globalPosition : 0,
      lastCalculated: now,
      createdAt: now,
      updatedAt: now
    };
  }
} 