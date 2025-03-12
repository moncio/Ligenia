import { Match, MatchScore } from '../../../core/domain/entities/match.entity';
import { IMatchRepository } from '../../../core/domain/interfaces/match-repository.interface';
import { BasePaginatedRepository } from './base.repository';
import { PaginationOptions, PaginatedResult } from '../../../core/domain/interfaces/repository.interface';

/**
 * Implementación del repositorio de partidos utilizando Prisma
 */
export class MatchRepository extends BasePaginatedRepository<Match, string> implements IMatchRepository {
  protected modelName = 'match';

  /**
   * Convierte valores null a undefined para compatibilidad con la entidad
   */
  private mapPrismaToEntity(data: any): any {
    return {
      id: data.id,
      tournamentId: data.tournamentId,
      team1Id: data.team1Id,
      team2Id: data.team2Id,
      scheduledDate: data.scheduledDate,
      courtId: data.courtId ?? undefined,
      status: data.status,
      score: data.score ? JSON.parse(data.score) : undefined,
      notes: data.notes ?? undefined,
      round: data.round ?? undefined,
      matchNumber: data.matchNumber ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Mapea una entidad a un objeto para Prisma
   */
  private mapEntityToPrisma(entity: Match): any {
    return {
      id: entity.id,
      tournamentId: entity.tournamentId,
      team1Id: entity.team1Id,
      team2Id: entity.team2Id,
      scheduledDate: entity.scheduledDate,
      courtId: entity.courtId,
      status: entity.status,
      score: entity.score ? JSON.stringify(entity.score) : null,
      notes: entity.notes,
      round: entity.round,
      matchNumber: entity.matchNumber,
    };
  }

  /**
   * Encuentra todos los partidos
   */
  async findAll(): Promise<Match[]> {
    const matches = await this.prisma.match.findMany();
    return matches.map(match => new Match(this.mapPrismaToEntity(match)));
  }

  /**
   * Encuentra un partido por su ID
   */
  async findById(id: string): Promise<Match | null> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return null;
    }

    return new Match(this.mapPrismaToEntity(match));
  }

  /**
   * Crea un nuevo partido
   */
  async create(entity: Omit<Match, 'id'>): Promise<Match> {
    const data = this.mapEntityToPrisma(entity as Match);
    const createdMatch = await this.prisma.match.create({
      data,
    });

    return new Match(this.mapPrismaToEntity(createdMatch));
  }

  /**
   * Actualiza un partido existente
   */
  async update(id: string, data: Partial<Match>): Promise<Match | null> {
    const existingMatch = await this.findById(id);
    if (!existingMatch) {
      return null;
    }

    const updatedMatch = await this.prisma.match.update({
      where: { id },
      data: this.mapEntityToPrisma({ ...existingMatch, ...data }),
    });

    return new Match(this.mapPrismaToEntity(updatedMatch));
  }

  /**
   * Elimina un partido
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.match.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Busca partidos por torneo
   */
  async findByTournament(tournamentId: string): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: { tournamentId },
    });

    return matches.map(match => new Match(this.mapPrismaToEntity(match)));
  }

  /**
   * Busca partidos por equipo
   */
  async findByTeam(teamId: string): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        OR: [
          { team1Id: teamId },
          { team2Id: teamId },
        ],
      },
    });

    return matches.map(match => new Match(this.mapPrismaToEntity(match)));
  }

  /**
   * Encuentra partidos paginados
   */
  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Match>> {
    return this.findPaginated(options);
  }
} 