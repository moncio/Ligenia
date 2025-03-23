import { Player as PrismaPlayer } from '@prisma/client';
import { Player } from '../../../../core/domain/player/player.entity';
import { PlayerLevel } from '../../../../core/domain/tournament/tournament.entity';

export class PlayerMapper {
  /**
   * Maps a Prisma Player model to a domain Player entity
   */
  public static toDomain(prismaPlayer: PrismaPlayer): Player {
    return new Player(
      prismaPlayer.id,
      prismaPlayer.userId,
      this.mapPrismaLevelToDomain(prismaPlayer.level),
      prismaPlayer.age,
      prismaPlayer.country,
      prismaPlayer.avatar_url,
      prismaPlayer.createdAt,
      prismaPlayer.updatedAt,
    );
  }

  /**
   * Maps a domain Player entity to a Prisma Player object for create/update
   */
  public static toPrisma(player: Player): Partial<PrismaPlayer> {
    return {
      id: player.id,
      userId: player.userId,
      level: this.mapDomainLevelToPrisma(player.level),
      age: player.age,
      country: player.country,
      avatar_url: player.avatarUrl,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    };
  }

  /**
   * Maps a Prisma player level to a domain PlayerLevel enum
   */
  public static mapPrismaLevelToDomain(level: PrismaPlayer['level']): PlayerLevel {
    const levelMap: Record<string, PlayerLevel> = {
      P1: PlayerLevel.P1,
      P2: PlayerLevel.P2,
      P3: PlayerLevel.P3,
    };

    return levelMap[level] || PlayerLevel.P3;
  }

  /**
   * Maps a domain PlayerLevel enum to a Prisma player level
   */
  public static mapDomainLevelToPrisma(level: PlayerLevel): PrismaPlayer['level'] {
    // Handle potential mapping to supported values in Prisma
    // If P4 or P5 are encountered, map them to P3 (default)
    if (level === PlayerLevel.P4 || level === PlayerLevel.P5) {
      return 'P3';
    }
    
    // Only include the valid Prisma levels (P1, P2, P3)
    // Type assertion is used because we're only mapping the available enum values
    const levelMap = {
      [PlayerLevel.P1]: 'P1',
      [PlayerLevel.P2]: 'P2',
      [PlayerLevel.P3]: 'P3',
    } as const;

    return levelMap[level] || 'P3';
  }
}
