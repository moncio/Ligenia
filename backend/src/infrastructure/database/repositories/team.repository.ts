import { Team } from '../../../core/domain/entities/team.entity';
import { ITeamRepository } from '../../../core/domain/interfaces/team-repository.interface';
import { BasePaginatedRepository } from './base.repository';

/**
 * Implementación del repositorio de equipos utilizando Prisma
 */
export class TeamRepository extends BasePaginatedRepository<Team, string> implements ITeamRepository {
  protected modelName = 'team';

  /**
   * Convierte valores null a undefined para compatibilidad con la entidad
   */
  private mapPrismaToEntity(data: any): any {
    return {
      id: data.id,
      name: data.name,
      tournamentId: data.tournamentId,
      players: data.players,
      ranking: data.ranking ?? undefined,
      logoUrl: data.logoUrl ?? undefined,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  /**
   * Mapea una entidad a un objeto para Prisma
   */
  private mapEntityToPrisma(entity: Team): any {
    return {
      id: entity.id,
      name: entity.name,
      tournamentId: entity.tournamentId,
      players: entity.players,
      ranking: entity.ranking,
      logoUrl: entity.logoUrl,
    };
  }

  /**
   * Encuentra todos los equipos
   */
  async findAll(): Promise<Team[]> {
    const teams = await this.prisma.team.findMany();
    return teams.map(team => new Team(this.mapPrismaToEntity(team)));
  }

  /**
   * Encuentra un equipo por su ID
   */
  async findById(id: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      return null;
    }

    return new Team(this.mapPrismaToEntity(team));
  }

  /**
   * Crea un nuevo equipo
   */
  async create(entity: Omit<Team, 'id'>): Promise<Team> {
    const data = this.mapEntityToPrisma(entity as Team);
    const createdTeam = await this.prisma.team.create({
      data,
    });

    return new Team(this.mapPrismaToEntity(createdTeam));
  }

  /**
   * Actualiza un equipo existente
   */
  async update(id: string, data: Partial<Team>): Promise<Team | null> {
    const existingTeam = await this.findById(id);
    if (!existingTeam) {
      return null;
    }

    const updatedTeam = await this.prisma.team.update({
      where: { id },
      data: this.mapEntityToPrisma({ ...existingTeam, ...data }),
    });

    return new Team(this.mapPrismaToEntity(updatedTeam));
  }

  /**
   * Elimina un equipo
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.team.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Busca equipos por torneo
   */
  async findByTournament(tournamentId: string): Promise<Team[]> {
    const teams = await this.prisma.team.findMany({
      where: { tournamentId },
    });

    return teams.map(team => new Team(this.mapPrismaToEntity(team)));
  }

  /**
   * Verifica si existe un equipo con el mismo nombre en el mismo torneo
   */
  async existsByNameInTournament(name: string, tournamentId: string): Promise<boolean> {
    const team = await this.prisma.team.findFirst({
      where: { name, tournamentId },
    });

    return !!team;
  }
} 