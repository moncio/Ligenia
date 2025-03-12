import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ILeagueRepository } from '../../domain/interfaces/league-repository.interface';
import { PaginatedResult, PaginationOptions } from '../../domain/interfaces/repository.interface';
import { League } from '../../domain/entities/league.entity';

/**
 * Caso de uso para obtener todas las ligas con paginación
 */
export class GetAllLeaguesUseCase implements IUseCase<PaginationOptions, PaginatedResult<League>> {
  constructor(private readonly leagueRepository: ILeagueRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param options Opciones de paginación
   * @returns Resultado con las ligas paginadas o un error
   */
  async execute(options: PaginationOptions): Promise<Result<PaginatedResult<League>>> {
    try {
      // Obtener las ligas con paginación
      const paginatedLeagues = await this.leagueRepository.findAllPaginated(options);
      
      return Result.ok(paginatedLeagues);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Error al obtener las ligas')
      );
    }
  }
} 