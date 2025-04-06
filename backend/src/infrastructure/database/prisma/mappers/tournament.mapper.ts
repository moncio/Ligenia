import { Tournament as PrismaTournament } from '@prisma/client';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../core/domain/tournament/tournament.entity';

export class TournamentMapper {
  /**
   * Maps a Prisma Tournament model to a domain Tournament entity
   */
  public static toDomain(prismaModel: PrismaTournament): Tournament {
    return new Tournament(
      prismaModel.id,
      prismaModel.name,
      prismaModel.description || '',
      prismaModel.startDate,
      prismaModel.endDate,
      this.mapPrismaFormatToDomain(prismaModel.format),
      this.mapPrismaStatusToDomain(prismaModel.status),
      prismaModel.location,
      null, // maxParticipants - to be retrieved separately from participants relationship
      prismaModel.registrationEndDate,
      this.mapPrismaCategoryToDomain(prismaModel.category),
      '', // createdById - not tracked in the schema
      prismaModel.createdAt,
      prismaModel.updatedAt,
    );
  }

  /**
   * Maps a domain Tournament entity to a Prisma Tournament create/update object
   */
  public static toPrisma(domainEntity: Tournament): Partial<PrismaTournament> {
    return {
      id: domainEntity.id,
      name: domainEntity.name,
      description: domainEntity.description,
      startDate: domainEntity.startDate,
      endDate: domainEntity.endDate as Date, // Prisma expects non-null here
      registrationEndDate: domainEntity.registrationDeadline as Date, // Prisma expects non-null here
      location: domainEntity.location,
      format: this.mapDomainFormatToPrisma(domainEntity.format),
      status: this.mapDomainStatusToPrisma(domainEntity.status),
      category: this.mapDomainCategoryToPrisma(domainEntity.category),
      createdAt: domainEntity.createdAt,
      updatedAt: domainEntity.updatedAt,
    };
  }

  /**
   * Maps a Prisma TournamentFormat to domain TournamentFormat
   */
  public static mapPrismaFormatToDomain(format: PrismaTournament['format']): TournamentFormat {
    // Ensure mapping between the Prisma and domain enums
    const formatMap: Record<string, TournamentFormat> = {
      SINGLE_ELIMINATION: TournamentFormat.SINGLE_ELIMINATION,
    };

    return formatMap[format] || TournamentFormat.SINGLE_ELIMINATION;
  }

  /**
   * Maps a domain TournamentFormat to Prisma TournamentFormat
   */
  public static mapDomainFormatToPrisma(format: TournamentFormat): PrismaTournament['format'] {
    // Mapping between domain and Prisma enum values
    const formatMap: Record<TournamentFormat, PrismaTournament['format']> = {
      [TournamentFormat.SINGLE_ELIMINATION]: 'SINGLE_ELIMINATION',
      [TournamentFormat.DOUBLE_ELIMINATION]: 'SINGLE_ELIMINATION', // Fallback to supported type
      [TournamentFormat.ROUND_ROBIN]: 'SINGLE_ELIMINATION', // Fallback to supported type
      [TournamentFormat.SWISS]: 'SINGLE_ELIMINATION', // Fallback to supported type
    };

    return formatMap[format];
  }

  /**
   * Maps a Prisma TournamentStatus to domain TournamentStatus
   */
  public static mapPrismaStatusToDomain(status: PrismaTournament['status']): TournamentStatus {
    // Ensure mapping between the Prisma and domain enums
    const statusMap: Record<string, TournamentStatus> = {
      DRAFT: TournamentStatus.DRAFT,
      ACTIVE: TournamentStatus.ACTIVE,
      COMPLETED: TournamentStatus.COMPLETED,
      CANCELLED: TournamentStatus.CANCELLED,
    };

    return statusMap[status] || TournamentStatus.DRAFT;
  }

  /**
   * Maps a domain TournamentStatus to Prisma TournamentStatus
   */
  public static mapDomainStatusToPrisma(status: TournamentStatus): PrismaTournament['status'] {
    // Mapping between domain and Prisma enum values
    const statusMap: Record<TournamentStatus, PrismaTournament['status']> = {
      [TournamentStatus.DRAFT]: 'DRAFT',
      [TournamentStatus.ACTIVE]: 'ACTIVE',
      [TournamentStatus.COMPLETED]: 'COMPLETED',
      [TournamentStatus.CANCELLED]: 'CANCELLED',
    };

    return statusMap[status];
  }

  /**
   * Maps a Prisma PlayerLevel to domain PlayerLevel
   */
  public static mapPrismaCategoryToDomain(category: PrismaTournament['category']): PlayerLevel {
    // Ensure mapping between the Prisma and domain enums
    const categoryMap: Record<string, PlayerLevel> = {
      P1: PlayerLevel.P1,
      P2: PlayerLevel.P2,
      P3: PlayerLevel.P3,
    };

    return categoryMap[category] || PlayerLevel.P3;
  }

  /**
   * Maps a domain PlayerLevel to Prisma PlayerLevel
   */
  public static mapDomainCategoryToPrisma(
    category: PlayerLevel | null,
  ): PrismaTournament['category'] {
    if (!category) return 'P3'; // Default

    // Mapping between domain and Prisma enum values
    const categoryMap: Record<PlayerLevel, PrismaTournament['category']> = {
      [PlayerLevel.P1]: 'P1',
      [PlayerLevel.P2]: 'P2',
      [PlayerLevel.P3]: 'P3',
    };

    return categoryMap[category];
  }
}
