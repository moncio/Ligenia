import { Team } from '../../domain/entities/team.entity';
import { ITeamRepository } from '../../domain/interfaces/team-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { PaginationOptions, PaginatedResult } from '../../domain/interfaces/repository.interface';

/**
 * Caso de uso para obtener todos los equipos con paginación
 */
export class GetAllTeamsUseCase implements IUseCase<PaginationOptions, PaginatedResult<Team>> {
  constructor(private readonly teamRepository: ITeamRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param options Opciones de paginación
   * @returns Resultado con los equipos paginados
   */
  async execute(options: PaginationOptions): Promise<Result<PaginatedResult<Team>>> {
    try {
      const paginatedTeams = await this.teamRepository.findAllPaginated(options);
      return Result.ok<PaginatedResult<Team>>(paginatedTeams);
    } catch (error) {
      return Result.fail<PaginatedResult<Team>>(
        error instanceof Error ? error : new Error('Error al obtener los equipos')
      );
    }
  }
} 