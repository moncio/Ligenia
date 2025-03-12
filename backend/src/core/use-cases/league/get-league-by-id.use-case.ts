import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';
import { ILeagueRepository } from '../../domain/interfaces/league-repository.interface';
import { League } from '../../domain/entities/league.entity';

/**
 * Caso de uso para obtener una liga por su ID
 */
export class GetLeagueByIdUseCase implements IUseCase<string, League> {
  constructor(private readonly leagueRepository: ILeagueRepository) {}

  /**
   * Ejecuta el caso de uso
   * @param id ID de la liga a obtener
   * @returns Resultado con la liga o un error
   */
  async execute(id: string): Promise<Result<League>> {
    try {
      // Buscar la liga por ID
      const league = await this.leagueRepository.findById(id);

      // Verificar si la liga existe
      if (!league) {
        return Result.fail(new Error('La liga no existe'));
      }

      return Result.ok(league);
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Error al obtener la liga')
      );
    }
  }
} 