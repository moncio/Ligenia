import { Statistic } from '../../domain/entities/statistic.entity';
import { GetPlayerStatisticsDto } from '../../domain/dtos/get-player-statistics.dto';
import { IStatisticRepository } from '../../domain/interfaces/statistic-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { ITournamentRepository } from '../../domain/interfaces/tournament-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para obtener las estadísticas de un jugador en un torneo
 */
export class GetPlayerStatisticsUseCase implements IUseCase<GetPlayerStatisticsDto, Statistic> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly userRepository: IUserRepository,
    private readonly tournamentRepository: ITournamentRepository
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param data Datos para obtener las estadísticas
   * @returns Resultado con las estadísticas del jugador o un error
   */
  async execute(data: GetPlayerStatisticsDto): Promise<Result<Statistic>> {
    try {
      // Verificar si el jugador existe
      const player = await this.userRepository.findById(data.playerId);
      if (!player) {
        return Result.fail<Statistic>(new Error('El jugador no existe'));
      }

      // Verificar si el torneo existe
      const tournament = await this.tournamentRepository.findById(data.tournamentId);
      if (!tournament) {
        return Result.fail<Statistic>(new Error('El torneo no existe'));
      }

      // Buscar estadísticas del jugador en el torneo
      const statistics = await this.statisticRepository.findByPlayerAndTournament(
        data.playerId,
        data.tournamentId
      );

      if (!statistics) {
        return Result.fail<Statistic>(new Error('No se encontraron estadísticas para este jugador en este torneo'));
      }

      return Result.ok<Statistic>(statistics);
    } catch (error: any) {
      return Result.fail<Statistic>(new Error(`Error al obtener las estadísticas: ${error.message}`));
    }
  }
} 