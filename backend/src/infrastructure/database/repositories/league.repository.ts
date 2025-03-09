import { League } from '../../../core/domain/entities/league.entity';
import { ILeagueRepository } from '../../../core/domain/interfaces/league-repository.interface';
import { BasePaginatedRepository } from './base.repository';
import { PaginationOptions, PaginatedResult } from '../../../core/domain/interfaces/repository.interface';

/**
 * Implementación del repositorio de ligas utilizando Prisma
 */
export class LeagueRepository extends BasePaginatedRepository<League, string> implements ILeagueRepository {
  protected modelName = 'league';

  /**
   * Convierte valores null a undefined para compatibilidad con la entidad
   */
  private mapPrismaToEntity(data: any): any {
    return {
      id: data.id,
      name: data.name,
      adminId: data.adminId,
      scoringType: data.scoringType,
      description: data.description ?? undefined,
      logoUrl: data.logoUrl ?? undefined,
      isPublic: data.isPublic,
      creationDate: data.creationDate,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Encuentra una liga por su ID
   */
  async findById(id: string): Promise<League | null> {
    const league = await this.prisma.league.findUnique({
      where: { id },
    });

    if (!league) {
      return null;
    }

    return new League(this.mapPrismaToEntity(league));
  }

  /**
   * Encuentra todas las ligas
   */
  async findAll(): Promise<League[]> {
    const leagues = await this.prisma.league.findMany();
    return leagues.map(league => new League(this.mapPrismaToEntity(league)));
  }

  /**
   * Encuentra todas las ligas con paginación
   */
  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<League>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const skip = (page - 1) * limit;
    
    const [leagues, total] = await Promise.all([
      this.prisma.league.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.league.count(),
    ]);

    return {
      data: leagues.map(league => new League(this.mapPrismaToEntity(league))),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Crea una nueva liga
   */
  async create(data: Omit<League, 'id'>): Promise<League> {
    const league = await this.prisma.league.create({
      data: {
        name: data.name,
        adminId: data.adminId,
        scoringType: data.scoringType,
        description: data.description,
        logoUrl: data.logoUrl,
        isPublic: data.isPublic ?? true,
        creationDate: data.creationDate ?? new Date(),
      },
    });

    return new League(this.mapPrismaToEntity(league));
  }

  /**
   * Actualiza una liga existente
   */
  async update(id: string, data: Partial<League>): Promise<League | null> {
    try {
      const league = await this.prisma.league.update({
        where: { id },
        data,
      });

      return new League(this.mapPrismaToEntity(league));
    } catch (error) {
      return null;
    }
  }

  /**
   * Elimina una liga
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.league.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Busca ligas por nombre
   */
  async findByName(name: string): Promise<League[]> {
    const leagues = await this.prisma.league.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });

    return leagues.map(league => new League(this.mapPrismaToEntity(league)));
  }

  /**
   * Busca ligas por administrador
   */
  async findByAdmin(adminId: string): Promise<League[]> {
    const leagues = await this.prisma.league.findMany({
      where: { adminId },
    });

    return leagues.map(league => new League(this.mapPrismaToEntity(league)));
  }

  /**
   * Verifica si existe una liga con el mismo nombre
   */
  async existsByName(name: string): Promise<boolean> {
    const count = await this.prisma.league.count({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });

    return count > 0;
  }
} 