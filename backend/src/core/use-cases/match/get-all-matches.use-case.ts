import { Match } from '../../domain/entities/match.entity';
import { IMatchRepository } from '../../domain/interfaces/match-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { PaginationOptions, PaginatedResult } from '../../domain/interfaces/repository.interface';

/**
 * Caso de uso para obtener todos los partidos con paginación
 */
export class GetAllMatchesUseCase implements IUseCase<PaginationOptions, PaginatedResult<Match>> {
  constructor(private readonly matchRepository: IMatchRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param options Opciones de paginación
   * @returns Resultado con los partidos paginados
   */
  async execute(options: PaginationOptions): Promise<Result<PaginatedResult<Match>>> {
    try {
      const paginatedMatches = await this.matchRepository.findAllPaginated(options);
      return Result.ok<PaginatedResult<Match>>(paginatedMatches);
    } catch (error) {
      return Result.fail<PaginatedResult<Match>>(
        error instanceof Error ? error : new Error('Error al obtener los partidos')
      );
    }
  }
} 