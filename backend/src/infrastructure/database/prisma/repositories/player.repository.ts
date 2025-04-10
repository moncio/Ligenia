import { PrismaClient } from '@prisma/client';
import { Player } from '../../../../core/domain/player/player.entity';
import {
  IPlayerRepository,
  PaginationOptions,
  PlayerFilter,
} from '../../../../core/application/interfaces/repositories/player.repository';
import { BaseRepository } from '../base-repository';
import { PlayerMapper } from '../mappers/player.mapper';
import { Result } from '../../../../shared/result';
import { PlayerLevel } from '../../../../core/domain/tournament/tournament.entity';
import { injectable } from 'inversify';

@injectable()
export class PlayerRepository extends BaseRepository implements IPlayerRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma);
  }

  async findById(id: string): Promise<Player | null> {
    const result = await this.executeOperation<Player | null>(async () => {
      const player = await this.prisma.player.findUnique({
        where: { id },
      });

      if (!player) {
        return null;
      }

      return PlayerMapper.toDomain(player);
    });
    
    return result.isSuccess ? result.getValue() : null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    const result = await this.executeOperation<Player | null>(async () => {
      const player = await this.prisma.player.findUnique({
        where: { userId },
      });

      if (!player) {
        return null;
      }

      return PlayerMapper.toDomain(player);
    });
    
    return result.isSuccess ? result.getValue() : null;
  }

  async findAll(filter?: PlayerFilter, pagination?: PaginationOptions): Promise<Player[]> {
    const result = await this.executeOperation<Player[]>(async () => {
      const whereClause = this.buildWhereClause(filter);

      const players = await this.prisma.player.findMany({
        where: whereClause,
        skip: pagination?.skip,
        take: pagination?.limit,
        orderBy: pagination?.sort
          ? {
              [pagination.sort.field]: pagination.sort.order,
            }
          : { createdAt: 'desc' },
      });

      return players.map(player => PlayerMapper.toDomain(player));
    });
    
    return result.isSuccess ? result.getValue() : [];
  }

  async count(filter?: PlayerFilter): Promise<number> {
    const result = await this.executeOperation<number>(async () => {
      const whereClause = this.buildWhereClause(filter);

      return await this.prisma.player.count({
        where: whereClause,
      });
    });
    
    return result.isSuccess ? result.getValue() : 0;
  }

  async findByLevel(level: PlayerLevel): Promise<Player[]> {
    const result = await this.executeOperation<Player[]>(async () => {
      const players = await this.prisma.player.findMany({
        where: {
          level: PlayerMapper.mapDomainLevelToPrisma(level),
        },
      });

      return players.map(player => PlayerMapper.toDomain(player));
    });
    
    return result.isSuccess ? result.getValue() : [];
  }

  async save(player: Player): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      const playerData = PlayerMapper.toPrisma(player);

      await this.prisma.player.upsert({
        where: { id: player.id },
        update: playerData,
        create: playerData as any, // Type assertion needed because create requires all fields
      });
      
      return undefined;
    });
    
    if (result.isFailure()) {
      throw result.getError();
    }
  }

  async update(player: Player): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      const playerData = PlayerMapper.toPrisma(player);

      await this.prisma.player.update({
        where: { id: player.id },
        data: playerData,
      });
      
      return undefined;
    });
    
    if (result.isFailure()) {
      throw result.getError();
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      await this.prisma.player.delete({
        where: { id },
      });

      return undefined;
    });
    
    if (result.isFailure()) {
      throw result.getError();
    }
  }

  /**
   * Builds a Prisma where clause based on the provided PlayerFilter
   */
  private buildWhereClause(filter?: PlayerFilter): any {
    if (!filter) return {};

    const whereClause: any = {};

    if (filter.userId) {
      whereClause.userId = filter.userId;
    }

    if (filter.level) {
      whereClause.level = PlayerMapper.mapDomainLevelToPrisma(filter.level);
    }

    if (filter.country) {
      whereClause.country = filter.country;
    }

    if (filter.searchTerm) {
      // Assuming there are other fields in the Player model that can be searched
      whereClause.OR = [
        {
          country: {
            contains: filter.searchTerm,
            mode: 'insensitive',
          },
        },
        // Add more searchable fields if needed
      ];
    }

    return whereClause;
  }
}
