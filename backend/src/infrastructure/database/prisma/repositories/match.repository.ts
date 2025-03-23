import { PrismaClient, MatchStatus as PrismaMatchStatus } from '@prisma/client';
import {
  IMatchRepository,
  MatchFilter,
} from '../../../../core/application/interfaces/repositories/match.repository';
import { Match, MatchStatus } from '../../../../core/domain/match/match.entity';
import { BaseRepository } from '../base-repository';
import { Result } from '../../../../shared/result';
import { injectable } from 'inversify';
import { MatchMapper } from '../mappers/match.mapper';

@injectable()
export class MatchRepository extends BaseRepository implements IMatchRepository {
  constructor(prisma?: PrismaClient) {
    super();
    if (prisma) {
      this.prisma = prisma;
    }
  }

  async findById(id: string): Promise<Match | null> {
    try {
      const result = await this.executeOperation<Match | null>(async () => {
        const match = await this.prisma.match.findUnique({
          where: { id },
        });

        if (!match) {
          return null;
        }

        return new Match(
          match.id,
          match.tournamentId,
          match.homePlayerOneId,
          match.homePlayerTwoId,
          match.awayPlayerOneId,
          match.awayPlayerTwoId,
          match.round,
          match.date,
          match.location,
          this.mapPrismaStatusToDomain(match.status),
          match.homeScore,
          match.awayScore,
          match.createdAt,
          match.updatedAt,
        );
      });

      return result.isSuccess ? result.getValue() : null;
    } catch (error) {
      console.error(`Error finding match by id: ${error}`);
      return null;
    }
  }

  async findByFilter(filter: MatchFilter): Promise<Match[]> {
    try {
      const result = await this.executeOperation<Match[]>(async () => {
        const whereClause = this.buildWhereClause(filter);
        const matches = await this.prisma.match.findMany({
          where: whereClause,
          skip: filter.offset || 0,
          take: filter.limit || undefined,
        });

        return matches.map(
          match =>
            new Match(
              match.id,
              match.tournamentId,
              match.homePlayerOneId,
              match.homePlayerTwoId,
              match.awayPlayerOneId,
              match.awayPlayerTwoId,
              match.round,
              match.date,
              match.location,
              this.mapPrismaStatusToDomain(match.status),
              match.homeScore,
              match.awayScore,
              match.createdAt,
              match.updatedAt,
            ),
        );
      });

      return result.isSuccess ? result.getValue() : [];
    } catch (error) {
      console.error(`Error finding matches by filter: ${error}`);
      return [];
    }
  }

  async find(filter: MatchFilter = {}, offset = 0, limit?: number): Promise<Result<Match[]>> {
    return this.executeOperation<Match[]>(async () => {
      const whereClause = this.buildWhereClause(filter);
      const matches = await this.prisma.match.findMany({
        where: whereClause,
        skip: offset,
        take: limit,
      });

      return matches.map(
        match =>
          new Match(
            match.id,
            match.tournamentId,
            match.homePlayerOneId,
            match.homePlayerTwoId,
            match.awayPlayerOneId,
            match.awayPlayerTwoId,
            match.round,
            match.date,
            match.location,
            this.mapPrismaStatusToDomain(match.status),
            match.homeScore,
            match.awayScore,
            match.createdAt,
            match.updatedAt,
          ),
      );
    });
  }

  async findByTournamentAndRound(tournamentId: string, round: number): Promise<Match[]> {
    try {
      const result = await this.executeOperation<Match[]>(async () => {
        const matches = await this.prisma.match.findMany({
          where: {
            tournamentId,
            round,
          },
        });

        return matches.map(
          match =>
            new Match(
              match.id,
              match.tournamentId,
              match.homePlayerOneId,
              match.homePlayerTwoId,
              match.awayPlayerOneId,
              match.awayPlayerTwoId,
              match.round,
              match.date,
              match.location,
              this.mapPrismaStatusToDomain(match.status),
              match.homeScore,
              match.awayScore,
              match.createdAt,
              match.updatedAt,
            ),
        );
      });

      return result.isSuccess ? result.getValue() : [];
    } catch (error) {
      console.error(`Error finding matches by tournament and round: ${error}`);
      return [];
    }
  }

  async findByPlayerId(playerId: string): Promise<Match[]> {
    try {
      const result = await this.executeOperation<Match[]>(async () => {
        const matches = await this.prisma.match.findMany({
          where: {
            OR: [
              { homePlayerOneId: playerId },
              { homePlayerTwoId: playerId },
              { awayPlayerOneId: playerId },
              { awayPlayerTwoId: playerId },
            ],
          },
        });

        return matches.map(
          match =>
            new Match(
              match.id,
              match.tournamentId,
              match.homePlayerOneId,
              match.homePlayerTwoId,
              match.awayPlayerOneId,
              match.awayPlayerTwoId,
              match.round,
              match.date,
              match.location,
              this.mapPrismaStatusToDomain(match.status),
              match.homeScore,
              match.awayScore,
              match.createdAt,
              match.updatedAt,
            ),
        );
      });

      return result.isSuccess ? result.getValue() : [];
    } catch (error) {
      console.error(`Error finding matches by player id: ${error}`);
      return [];
    }
  }

  async findByTournamentAndPlayerId(
    tournamentId: string,
    playerId: string,
  ): Promise<Result<Match[]>> {
    return this.executeOperation<Match[]>(async () => {
      const matches = await this.prisma.match.findMany({
        where: {
          tournamentId,
          OR: [
            { homePlayerOneId: playerId },
            { homePlayerTwoId: playerId },
            { awayPlayerOneId: playerId },
            { awayPlayerTwoId: playerId },
          ],
        },
      });

      return matches.map(
        match =>
          new Match(
            match.id,
            match.tournamentId,
            match.homePlayerOneId,
            match.homePlayerTwoId,
            match.awayPlayerOneId,
            match.awayPlayerTwoId,
            match.round,
            match.date,
            match.location,
            this.mapPrismaStatusToDomain(match.status),
            match.homeScore,
            match.awayScore,
            match.createdAt,
            match.updatedAt,
          ),
      );
    });
  }

  /**
   * Saves a match to the database
   */
  async save(match: Match): Promise<void> {
    try {
      const prismaMatch = MatchMapper.toPrisma(match);

      // Handle create or update with proper relations
      await this.prisma.match.upsert({
        where: { id: match.id },
        update: {
          tournamentId: prismaMatch.tournamentId,
          homePlayerOneId: prismaMatch.homePlayerOneId,
          homePlayerTwoId: prismaMatch.homePlayerTwoId,
          awayPlayerOneId: prismaMatch.awayPlayerOneId || null,
          awayPlayerTwoId: prismaMatch.awayPlayerTwoId || null,
          round: prismaMatch.round,
          date: prismaMatch.date,
          location: prismaMatch.location,
          status: prismaMatch.status,
          homeScore: prismaMatch.homeScore,
          awayScore: prismaMatch.awayScore,
          updatedAt: new Date(),
        },
        create: {
          id: prismaMatch.id,
          tournamentId: prismaMatch.tournamentId,
          homePlayerOneId: prismaMatch.homePlayerOneId,
          homePlayerTwoId: prismaMatch.homePlayerTwoId,
          awayPlayerOneId: prismaMatch.awayPlayerOneId || null,
          awayPlayerTwoId: prismaMatch.awayPlayerTwoId || null,
          round: prismaMatch.round,
          date: prismaMatch.date,
          location: prismaMatch.location,
          status: prismaMatch.status,
          homeScore: prismaMatch.homeScore,
          awayScore: prismaMatch.awayScore,
          createdAt: prismaMatch.createdAt || new Date(),
          updatedAt: prismaMatch.updatedAt || new Date(),
        },
      });
    } catch (error) {
      console.error('Error saving match:', error);
      throw error;
    }
  }

  /**
   * Saves a match and returns Result object
   */
  async saveWithResult(match: Match): Promise<Result<Match>> {
    return this.executeOperation<Match>(async () => {
      const prismaMatch = MatchMapper.toPrisma(match);
      let savedMatch;

      try {
        // Check if the match exists
        const existingMatch = await this.prisma.match.findUnique({
          where: { id: match.id },
        });

        if (existingMatch) {
          // Update existing match
          savedMatch = await this.prisma.match.update({
            where: { id: match.id },
            data: {
              tournamentId: prismaMatch.tournamentId,
              homePlayerOneId: prismaMatch.homePlayerOneId,
              homePlayerTwoId: prismaMatch.homePlayerTwoId,
              awayPlayerOneId: prismaMatch.awayPlayerOneId || null,
              awayPlayerTwoId: prismaMatch.awayPlayerTwoId || null,
              round: prismaMatch.round,
              date: prismaMatch.date,
              location: prismaMatch.location,
              status: prismaMatch.status,
              homeScore: prismaMatch.homeScore,
              awayScore: prismaMatch.awayScore,
              updatedAt: new Date(),
            },
          });
        } else {
          // Create new match
          savedMatch = await this.prisma.match.create({
            data: {
              id: prismaMatch.id,
              tournament: {
                connect: { id: prismaMatch.tournamentId },
              },
              homePlayerOne: {
                connect: { id: prismaMatch.homePlayerOneId },
              },
              homePlayerTwo: {
                connect: { id: prismaMatch.homePlayerTwoId },
              },
              awayPlayerOne: prismaMatch.awayPlayerOneId
                ? {
                    connect: { id: prismaMatch.awayPlayerOneId },
                  }
                : undefined,
              awayPlayerTwo: prismaMatch.awayPlayerTwoId
                ? {
                    connect: { id: prismaMatch.awayPlayerTwoId },
                  }
                : undefined,
              round: prismaMatch.round,
              date: prismaMatch.date,
              location: prismaMatch.location,
              status: prismaMatch.status,
              homeScore: prismaMatch.homeScore,
              awayScore: prismaMatch.awayScore,
              createdAt: prismaMatch.createdAt || new Date(),
              updatedAt: prismaMatch.updatedAt || new Date(),
            },
          });
        }

        return MatchMapper.toDomain(savedMatch);
      } catch (error) {
        console.error('Error saving match:', error);
        throw error;
      }
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.executeOperation<boolean>(async () => {
        await this.prisma.match.delete({
          where: { id },
        });
        return true;
      });

      return result.isSuccess;
    } catch (error) {
      console.error(`Error deleting match: ${error}`);
      return false;
    }
  }

  async count(filter: MatchFilter = {}): Promise<number> {
    try {
      const result = await this.executeOperation<number>(async () => {
        const whereClause = this.buildWhereClause(filter);
        return await this.prisma.match.count({
          where: whereClause,
        });
      });

      return result.isSuccess ? result.getValue() : 0;
    } catch (error) {
      console.error(`Error counting matches: ${error}`);
      return 0;
    }
  }

  async countWithResult(filter: MatchFilter = {}): Promise<Result<number>> {
    return this.executeOperation<number>(async () => {
      const whereClause = this.buildWhereClause(filter);
      return await this.prisma.match.count({
        where: whereClause,
      });
    });
  }

  async tournamentHasMatches(tournamentId: string): Promise<boolean> {
    try {
      const result = await this.executeOperation<boolean>(async () => {
        const count = await this.prisma.match.count({
          where: { tournamentId },
        });
        return count > 0;
      });

      return result.isSuccess ? result.getValue() : false;
    } catch (error) {
      console.error(`Error checking if tournament has matches: ${error}`);
      return false;
    }
  }

  async tournamentHasMatchesWithResult(tournamentId: string): Promise<Result<boolean>> {
    return this.executeOperation<boolean>(async () => {
      const count = await this.prisma.match.count({
        where: { tournamentId },
      });
      return count > 0;
    });
  }

  // Helper methods for mapping between domain and Prisma status
  private mapDomainStatusToPrisma(status: MatchStatus): PrismaMatchStatus {
    switch (status) {
      case MatchStatus.PENDING:
        return PrismaMatchStatus.PENDING;
      case MatchStatus.SCHEDULED:
        return PrismaMatchStatus.PENDING; // Prisma doesn't have SCHEDULED, map to PENDING
      case MatchStatus.IN_PROGRESS:
        return PrismaMatchStatus.IN_PROGRESS;
      case MatchStatus.COMPLETED:
        return PrismaMatchStatus.COMPLETED;
      case MatchStatus.CANCELED:
        return PrismaMatchStatus.CANCELLED; // Note the spelling difference
      default:
        return PrismaMatchStatus.PENDING;
    }
  }

  private mapPrismaStatusToDomain(status: PrismaMatchStatus): MatchStatus {
    switch (status) {
      case PrismaMatchStatus.PENDING:
        return MatchStatus.PENDING;
      case PrismaMatchStatus.IN_PROGRESS:
        return MatchStatus.IN_PROGRESS;
      case PrismaMatchStatus.COMPLETED:
        return MatchStatus.COMPLETED;
      case PrismaMatchStatus.CANCELLED:
        return MatchStatus.CANCELED; // Note the spelling difference
      default:
        return MatchStatus.PENDING;
    }
  }

  private buildWhereClause(filter: MatchFilter) {
    // Construct a Prisma where clause based on the filter
    const whereClause: any = {};

    if (filter.tournamentId) {
      whereClause.tournamentId = filter.tournamentId;
    }

    if (filter.userId) {
      whereClause.OR = [
        { homePlayerOneId: filter.userId },
        { homePlayerTwoId: filter.userId },
        { awayPlayerOneId: filter.userId },
        { awayPlayerTwoId: filter.userId },
      ];
    }

    if (filter.round !== undefined) {
      whereClause.round = filter.round;
    }

    if (filter.status !== undefined) {
      whereClause.status = this.mapDomainStatusToPrisma(filter.status);
    }

    if (filter.fromDate || filter.toDate) {
      whereClause.date = {};

      if (filter.fromDate) {
        whereClause.date.gte = filter.fromDate;
      }

      if (filter.toDate) {
        whereClause.date.lte = filter.toDate;
      }
    }

    return whereClause;
  }
}
