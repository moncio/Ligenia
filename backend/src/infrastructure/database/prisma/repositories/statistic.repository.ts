import { PrismaClient } from '@prisma/client';
import { Statistic } from '../../../../core/domain/statistic/statistic.entity';
import { IStatisticRepository, StatisticFilter, PaginationOptions } from '../../../../core/application/interfaces/repositories/statistic.repository';
import { BaseRepository } from '../base-repository';
import { StatisticMapper } from '../mappers/statistic.mapper';
import { injectable } from 'inversify';

@injectable()
export class StatisticRepository extends BaseRepository implements IStatisticRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super();
  }

  async findById(id: string): Promise<Statistic | null> {
    const result = await this.executeOperation<Statistic | null>(async () => {
      const statistic = await this.prisma.statistic.findUnique({
        where: { id },
      });

      if (!statistic) {
        return null;
      }

      return StatisticMapper.toDomain(statistic);
    });

    return result.isSuccess ? result.getValue() as Statistic | null : null;
  }

  async findByPlayerId(playerId: string): Promise<Statistic | null> {
    const result = await this.executeOperation<Statistic | null>(async () => {
      const statistic = await this.prisma.statistic.findFirst({
        where: { userId: playerId },
      });

      if (!statistic) {
        return null;
      }

      return StatisticMapper.toDomain(statistic);
    });

    return result.isSuccess ? result.getValue() as Statistic | null : null;
  }

  async findAll(filter?: StatisticFilter, pagination?: PaginationOptions): Promise<Statistic[]> {
    const result = await this.executeOperation<Statistic[]>(async () => {
      const where: any = {};

      if (filter) {
        if (filter.playerId) {
          where.userId = filter.playerId;
        }

        if (filter.tournamentId) {
          where.tournamentId = filter.tournamentId;
        }

        if (filter.dateRange) {
          where.updatedAt = {
            gte: filter.dateRange.startDate,
            lte: filter.dateRange.endDate,
          };
        }
      }

      const orderBy: any = {};
      if (pagination?.sort) {
        // Map domain-level sort fields to Prisma fields
        const fieldMap: Record<string, string> = {
          winRate: 'wins', // Sort by wins as approximation
          matchesPlayed: 'matchesPlayed',
          tournamentsWon: 'points', // Sort by points as approximation
          averageScore: 'points', // Sort by points as approximation
        };

        const mappedField = fieldMap[pagination.sort.field] || 'updatedAt';
        orderBy[mappedField] = pagination.sort.order;
      } else {
        orderBy.updatedAt = 'desc';
      }

      const statistics = await this.prisma.statistic.findMany({
        where,
        orderBy,
        skip: pagination?.skip || 0,
        take: pagination?.limit || 50,
      });

      return statistics.map(StatisticMapper.toDomain);
    });

    return result.isSuccess ? result.getValue() as Statistic[] : [];
  }

  async count(filter?: StatisticFilter): Promise<number> {
    const result = await this.executeOperation<number>(async () => {
      const where: any = {};

      if (filter) {
        if (filter.playerId) {
          where.userId = filter.playerId;
        }

        if (filter.tournamentId) {
          where.tournamentId = filter.tournamentId;
        }

        if (filter.dateRange) {
          where.updatedAt = {
            gte: filter.dateRange.startDate,
            lte: filter.dateRange.endDate,
          };
        }
      }

      return await this.prisma.statistic.count({ where });
    });

    return result.isSuccess ? result.getValue() as number : 0;
  }

  async save(statistic: Statistic, tournamentId?: string): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      // Statistic requires a tournamentId, so we need to either:
      // 1. Use the provided tournamentId parameter
      // 2. Find an existing statistic for this player to get its tournamentId
      // 3. Find a tournament the user is participating in
      // 4. Throw an error if no valid tournament is found
      
      let targetTournamentId = tournamentId;
      
      if (!targetTournamentId) {
        // Try to find existing statistics for this player
        const existingStats = await this.prisma.statistic.findFirst({
          where: { userId: statistic.playerId },
        });
        
        if (existingStats) {
          targetTournamentId = existingStats.tournamentId;
        } else {
          // Try to find a tournament the user is participating in
          const userTournament = await this.prisma.tournament.findFirst({
            where: {
              participants: {
                some: {
                  id: statistic.playerId
                }
              }
            }
          });
          
          if (userTournament) {
            targetTournamentId = userTournament.id;
          } else {
            throw new Error('Unable to save statistic: No valid tournament found for user');
          }
        }
      }
      
      const statisticData = StatisticMapper.toPrisma(statistic, targetTournamentId);
      
      if (await this.prisma.statistic.findUnique({ where: { id: statistic.id } })) {
        await this.prisma.statistic.update({
          where: { id: statistic.id },
          data: statisticData,
        });
      } else {
        await this.prisma.statistic.create({
          data: {
            id: statisticData.id!,
            userId: statisticData.userId!,
            tournamentId: statisticData.tournamentId!,
            matchesPlayed: statisticData.matchesPlayed || 0,
            wins: statisticData.wins || 0,
            losses: statisticData.losses || 0,
            points: statisticData.points || 0,
            rank: statisticData.rank || 0,
          },
        });
      }
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }

  async update(statistic: Statistic): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      // Find the existing statistic to get the tournamentId
      const existingStatistic = await this.prisma.statistic.findUnique({
        where: { id: statistic.id },
      });

      if (!existingStatistic) {
        throw new Error(`Statistic with ID ${statistic.id} not found`);
      }

      const statisticData = StatisticMapper.toPrisma(statistic, existingStatistic.tournamentId);

      await this.prisma.statistic.update({
        where: { id: statistic.id },
        data: statisticData,
      });
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      await this.prisma.statistic.delete({
        where: { id },
      });
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }

  async findByTournamentId(tournamentId: string): Promise<Statistic[]> {
    const result = await this.executeOperation<Statistic[]>(async () => {
      const statistics = await this.prisma.statistic.findMany({
        where: { tournamentId },
        orderBy: { points: 'desc' },
      });

      return statistics.map(StatisticMapper.toDomain);
    });

    return result.isSuccess ? result.getValue() as Statistic[] : [];
  }
} 