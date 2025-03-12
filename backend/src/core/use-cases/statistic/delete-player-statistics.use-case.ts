import { DeletePlayerStatisticsDto } from '../../domain/dtos/delete-player-statistics.dto';
import { IStatisticRepository } from '../../domain/interfaces/statistic-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para eliminar las estadísticas de un jugador en un torneo
 */
export class DeletePlayerStatisticsUseCase implements IUseCase<DeletePlayerStatisticsDto, boolean> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly userRepository: IUserRepository,
    private readonly tournamentRepository: ITournamentRepository
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param data Datos para eliminar las estadísticas
   * @returns Resultado con true si se eliminaron las estadísticas o un error
   */
  async execute(data: DeletePlayerStatisticsDto): Promise<Result<boolean>> {
    try {
      // Verificar si el jugador existe
      const player = await this.userRepository.findById(data.playerId);
      if (!player) {
        return Result.fail<boolean>(new Error('El jugador no existe'));
      }

      // Verificar si el torneo existe
      const tournament = await this.tournamentRepository.findById(data.tournamentId);
      if (!tournament) {
        return Result.fail<boolean>(new Error('El torneo no existe'));
      }

      // Buscar las estadísticas del jugador en el torneo
      const statistics = await this.statisticRepository.findByPlayerAndTournament(
        data.playerId,
        data.tournamentId
      );

      if (!statistics) {
        return Result.fail<boolean>(new Error('No se encontraron estadísticas para este jugador en este torneo'));
      }

      // Eliminar las estadísticas
      const deleted = await this.statisticRepository.delete(statistics.id);
      if (!deleted) {
        return Result.fail<boolean>(new Error('No se pudieron eliminar las estadísticas'));
      }

      return Result.ok<boolean>(true);
    } catch (error: any) {
      return Result.fail<boolean>(new Error(`Error al eliminar las estadísticas: ${error.message}`));
    }
  }
}