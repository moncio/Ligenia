import { Statistic } from '../../domain/entities/statistic.entity';
import { IStatisticRepository } from '../../domain/interfaces/statistic-repository.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para obtener las estadísticas de todos los jugadores en un torneo
 */
export class GetTournamentStatisticsUseCase implements IUseCase<string, Statistic[]> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly tournamentRepository: ITournamentRepository
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param tournamentId ID del torneo del que se quieren obtener las estadísticas
   * @returns Resultado con las estadísticas de todos los jugadores en el torneo o un error
   */
  async execute(tournamentId: string): Promise<Result<Statistic[]>> {
    try {
      // Verificar si el torneo existe
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail<Statistic[]>(new Error('El torneo no existe'));
      }

      // Obtener todas las estadísticas del torneo
      const statistics = await this.statisticRepository.findByTournament(tournamentId);

      return Result.ok<Statistic[]>(statistics);
    } catch (error: any) {
      return Result.fail<Statistic[]>(new Error(`Error al obtener las estadísticas del torneo: ${error.message}`));
    }
  }
} 