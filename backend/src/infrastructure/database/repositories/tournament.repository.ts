import { Tournament } from '../../../core/domain/entities/tournament.entity';
import { ITournamentRepository } from '../../../core/domain/interfaces/tournament-repository.interface';
import { BasePaginatedRepository } from './base.repository';
import { PaginationOptions, PaginatedResult } from '../../../core/domain/interfaces/repository.interface';

/**
 * Implementación del repositorio de torneos utilizando Prisma
 */
export class TournamentRepository extends BasePaginatedRepository<Tournament, string> implements ITournamentRepository {
  protected modelName = 'tournament';

  /**
   * Convierte valores null a undefined para compatibilidad con la entidad
   */
  private mapPrismaToEntity(data: any): any {
    return {
      id: data.id,
      name: data.name,
      leagueId: data.leagueId,
      format: data.format,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate ?? undefined,
      description: data.description ?? undefined,
      maxParticipants: data.maxTeams ?? undefined,
      minParticipants: data.minTeams ?? undefined,
      registrationDeadline: data.registrationDeadline ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Encuentra un torneo por su ID
   */
  async findById(id: string): Promise<Tournament | null> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      return null;
    }

    return new Tournament(this.mapPrismaToEntity(tournament));
  }

  /**
   * Encuentra todos los torneos
   */
  async findAll(): Promise<Tournament[]> {
    const tournaments = await this.prisma.tournament.findMany();
    return tournaments.map(tournament => new Tournament(this.mapPrismaToEntity(tournament)));
  }

  /**
   * Encuentra todos los torneos con paginación
   */
  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Tournament>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const skip = (page - 1) * limit;
    
    const [tournaments, total] = await Promise.all([
      this.prisma.tournament.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.tournament.count(),
    ]);

    return {
      data: tournaments.map(tournament => new Tournament(this.mapPrismaToEntity(tournament))),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Crea un nuevo torneo
   */
  async create(data: Omit<Tournament, 'id'>): Promise<Tournament> {
    // Crear un objeto con los datos que sabemos que son válidos
    const prismaData: any = {
      name: data.name,
      leagueId: data.leagueId,
      format: data.format,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      maxTeams: data.maxParticipants,
      minTeams: data.minParticipants,
    };
    
    // Añadir registrationDeadline si existe
    if (data.registrationDeadline) {
      prismaData.registrationDeadline = data.registrationDeadline;
    }

    const tournament = await this.prisma.tournament.create({
      data: prismaData,
    });

    return new Tournament(this.mapPrismaToEntity(tournament));
  }

  /**
   * Actualiza un torneo existente
   */
  async update(id: string, data: Partial<Tournament>): Promise<Tournament | null> {
    try {
      // Transformar los nombres de los campos para que coincidan con el esquema de Prisma
      const prismaData: any = { ...data };
      
      if (data.maxParticipants !== undefined) {
        prismaData.maxTeams = data.maxParticipants;
        delete prismaData.maxParticipants;
      }
      
      if (data.minParticipants !== undefined) {
        prismaData.minTeams = data.minParticipants;
        delete prismaData.minParticipants;
      }
      
      // Eliminar registrationDeadline si existe
      if ('registrationDeadline' in prismaData) {
        delete prismaData.registrationDeadline;
      }

      const tournament = await this.prisma.tournament.update({
        where: { id },
        data: prismaData,
      });

      return new Tournament(this.mapPrismaToEntity(tournament));
    } catch (error) {
      return null;
    }
  }

  /**
   * Elimina un torneo
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.tournament.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Busca torneos por liga
   */
  async findByLeague(leagueId: string): Promise<Tournament[]> {
    const tournaments = await this.prisma.tournament.findMany({
      where: { leagueId },
    });

    return tournaments.map(tournament => new Tournament(this.mapPrismaToEntity(tournament)));
  }

  /**
   * Verifica si existe un torneo con el mismo nombre en la misma liga
   */
  async existsByNameInLeague(name: string, leagueId: string): Promise<boolean> {
    const count = await this.prisma.tournament.count({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
        leagueId,
      },
    });

    return count > 0;
  }
} 