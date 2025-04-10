import { Match as PrismaMatch } from '@prisma/client';
import { Match, MatchStatus } from '../../../../core/domain/match/match.entity';

export class MatchMapper {
  /**
   * Maps a Prisma Match model to a domain Match entity
   */
  public static toDomain(prismaModel: PrismaMatch): Match {
    return new Match(
      prismaModel.id,
      prismaModel.tournamentId,
      prismaModel.homePlayerOneId,
      prismaModel.homePlayerTwoId,
      prismaModel.awayPlayerOneId,
      prismaModel.awayPlayerTwoId,
      prismaModel.round,
      prismaModel.date,
      prismaModel.location,
      this.mapPrismaStatusToDomain(prismaModel.status),
      prismaModel.homeScore,
      prismaModel.awayScore,
      prismaModel.createdAt,
      prismaModel.updatedAt,
    );
  }

  /**
   * Maps a domain Match entity to a Prisma Match create/update object
   */
  public static toPrisma(domainEntity: Match): Partial<PrismaMatch> {
    return {
      id: domainEntity.id,
      tournamentId: domainEntity.tournamentId,
      homePlayerOneId: domainEntity.homePlayerOneId,
      homePlayerTwoId: domainEntity.homePlayerTwoId,
      awayPlayerOneId: domainEntity.awayPlayerOneId,
      awayPlayerTwoId: domainEntity.awayPlayerTwoId,
      round: domainEntity.round,
      date: domainEntity.date,
      location: domainEntity.location,
      status: this.mapDomainStatusToPrisma(domainEntity.status),
      homeScore: domainEntity.homeScore,
      awayScore: domainEntity.awayScore,
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt,
    };
  }

  /**
   * Maps a Prisma MatchStatus to domain MatchStatus
   */
  public static mapPrismaStatusToDomain(status: PrismaMatch['status']): MatchStatus {
    // Ensure mapping between the Prisma and domain enums
    const statusMap: Record<string, MatchStatus> = {
      PENDING: MatchStatus.PENDING,
      IN_PROGRESS: MatchStatus.IN_PROGRESS,
      COMPLETED: MatchStatus.COMPLETED,
      CANCELLED: MatchStatus.CANCELED, // Note: Prisma uses "CANCELLED" while domain uses "CANCELED"
      SCHEDULED: MatchStatus.SCHEDULED, // Add explicit mapping for SCHEDULED
    };

    // Return mapped status or default to PENDING
    return statusMap[status as string] || MatchStatus.PENDING;
  }

  /**
   * Maps a domain MatchStatus to Prisma MatchStatus
   */
  public static mapDomainStatusToPrisma(status: MatchStatus): PrismaMatch['status'] {
    // Mapping between domain and Prisma enum values
    const statusMap: Record<MatchStatus, string> = {
      [MatchStatus.PENDING]: 'PENDING',
      [MatchStatus.SCHEDULED]: 'SCHEDULED', // Map to SCHEDULED Prisma status if available
      [MatchStatus.IN_PROGRESS]: 'IN_PROGRESS',
      [MatchStatus.COMPLETED]: 'COMPLETED',
      [MatchStatus.CANCELED]: 'CANCELLED', // Note: Domain uses "CANCELED" while Prisma uses "CANCELLED"
    };

    return statusMap[status] as PrismaMatch['status'];
  }
}
