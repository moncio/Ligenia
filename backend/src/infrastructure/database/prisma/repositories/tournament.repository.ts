import { Tournament } from "../../../../core/domain/tournament/tournament.entity";
import { 
  ITournamentRepository, 
  PaginationOptions, 
  TournamentFilter 
} from "../../../../core/application/interfaces/repositories/tournament.repository";
import { BaseRepository } from "../base-repository";
import { TournamentMapper } from "../mappers/tournament.mapper";
import { Prisma, PrismaClient } from "@prisma/client";
import { injectable, inject } from "inversify";

@injectable()
export class TournamentRepository extends BaseRepository implements ITournamentRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma);
  }
  
  /**
   * Find a tournament by ID
   */
  async findById(id: string): Promise<Tournament | null> {
    return this.executeOperation(async () => {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id }
      });
      
      if (!tournament) return null;
      
      return TournamentMapper.toDomain(tournament);
    }).then(result => result.isSuccess ? result.getValue() : null);
  }

  /**
   * Find all tournaments with optional filtering and pagination
   */
  async findAll(
    filter?: TournamentFilter, 
    pagination?: PaginationOptions
  ): Promise<Tournament[]> {
    return this.executeOperation(async () => {
      const whereClause = this.buildWhereClause(filter);
      
      const tournaments = await this.prisma.tournament.findMany({
        where: whereClause,
        skip: pagination?.skip || 0,
        take: pagination?.limit || 50,
        orderBy: pagination?.sort 
          ? { [pagination.sort.field]: pagination.sort.order } 
          : { startDate: 'desc' }
      });
      
      return tournaments.map(tournament => TournamentMapper.toDomain(tournament));
    }).then(result => result.isSuccess ? result.getValue() : []);
  }

  /**
   * Count tournaments with optional filtering
   */
  async count(filter?: TournamentFilter): Promise<number> {
    return this.executeOperation(async () => {
      const whereClause = this.buildWhereClause(filter);
      
      return await this.prisma.tournament.count({
        where: whereClause
      });
    }).then(result => result.isSuccess ? result.getValue() : 0);
  }

  /**
   * Save a new tournament
   */
  async save(tournament: Tournament): Promise<void> {
    const result = await this.executeOperation(async () => {
      const prismaData = TournamentMapper.toPrisma(tournament);
      
      await this.prisma.tournament.create({
        data: prismaData as Prisma.TournamentCreateInput
      });
    });
    
    if (result.isFailure()) {
      throw result.getError();
    }
  }

  /**
   * Update an existing tournament
   */
  async update(tournament: Tournament): Promise<void> {
    const result = await this.executeOperation(async () => {
      const prismaData = TournamentMapper.toPrisma(tournament);
      
      await this.prisma.tournament.update({
        where: { id: tournament.id },
        data: prismaData
      });
    });
    
    if (result.isFailure()) {
      throw result.getError();
    }
  }

  /**
   * Delete a tournament by ID
   */
  async delete(id: string): Promise<void> {
    const result = await this.executeOperation(async () => {
      await this.prisma.tournament.delete({
        where: { id }
      });
    });
    
    if (result.isFailure()) {
      throw result.getError();
    }
  }

  /**
   * Count participants in a tournament
   */
  async countParticipants(tournamentId: string): Promise<number> {
    return this.executeOperation(async () => {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          _count: {
            select: { participants: true }
          }
        }
      });
      
      return tournament?._count?.participants || 0;
    }).then(result => result.isSuccess ? result.getValue() : 0);
  }

  /**
   * Register a participant to a tournament
   */
  async registerParticipant(tournamentId: string, playerId: string): Promise<void> {
    return this.executeOperation(async () => {
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          participants: {
            connect: { id: playerId }
          }
        }
      });
    }).then(result => {
      if (result.isFailure) {
        throw result.getError();
      }
    });
  }

  /**
   * Unregister a participant from a tournament
   */
  async unregisterParticipant(tournamentId: string, playerId: string): Promise<void> {
    return this.executeOperation(async () => {
      await this.prisma.tournament.update({
        where: { id: tournamentId },
        data: {
          participants: {
            disconnect: { id: playerId }
          }
        }
      });
    }).then(result => {
      if (result.isFailure) {
        throw result.getError();
      }
    });
  }

  /**
   * Check if a participant is registered to a tournament
   */
  async isParticipantRegistered(tournamentId: string, playerId: string): Promise<boolean> {
    return this.executeOperation(async () => {
      const count = await this.prisma.tournament.count({
        where: {
          id: tournamentId,
          participants: {
            some: {
              id: playerId
            }
          }
        }
      });
      
      return count > 0;
    }).then(result => result.isSuccess ? result.getValue() : false);
  }

  /**
   * Get participants of a tournament with optional pagination
   */
  async getParticipants(tournamentId: string, pagination?: PaginationOptions): Promise<string[]> {
    return this.executeOperation(async () => {
      const tournament = await this.prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          participants: {
            select: { id: true },
            skip: pagination?.skip || 0,
            take: pagination?.limit || 50,
            orderBy: pagination?.sort 
              ? { [pagination.sort.field]: pagination.sort.order } 
              : undefined
          }
        }
      });
      
      if (!tournament) return [];
      
      return tournament.participants.map(p => p.id);
    }).then(result => result.isSuccess ? result.getValue() : []);
  }

  /**
   * Count participants in a tournament
   * (Alias for countParticipants for compatibility with interface)
   */
  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    return this.countParticipants(tournamentId);
  }

  /**
   * Build Prisma where clause from tournament filter
   */
  private buildWhereClause(filter?: TournamentFilter): Prisma.TournamentWhereInput {
    if (!filter) return {};
    
    const whereClause: Prisma.TournamentWhereInput = {};
    
    if (filter.status) {
      whereClause.status = TournamentMapper.mapDomainStatusToPrisma(filter.status);
    }
    
    if (filter.category) {
      whereClause.category = TournamentMapper.mapDomainCategoryToPrisma(filter.category);
    }
    
    if (filter.dateRange) {
      if (filter.dateRange.from) {
        whereClause.startDate = {
          ...(whereClause.startDate as Prisma.DateTimeFilter<"Tournament"> || {}),
          gte: filter.dateRange.from
        };
      }
      
      if (filter.dateRange.to) {
        whereClause.endDate = {
          ...(whereClause.endDate as Prisma.DateTimeFilter<"Tournament"> || {}),
          lte: filter.dateRange.to
        };
      }
    }
    
    if (filter.searchTerm) {
      whereClause.OR = [
        { name: { contains: filter.searchTerm, mode: 'insensitive' } },
        { description: { contains: filter.searchTerm, mode: 'insensitive' } }
      ];
    }
    
    return whereClause;
  }
} 