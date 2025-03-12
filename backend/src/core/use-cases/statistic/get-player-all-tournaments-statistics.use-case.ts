import { Statistic } from '../../domain/entities/statistic.entity';
import { GetPlayerAllTournamentsStatisticsDto } from '../../domain/dtos/get-player-all-tournaments-statistics.dto';
import { IStatisticRepository } from '../../domain/interfaces/statistic-repository.interface';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { IUseCase, Result } from '../../domain/interfaces/use-case.interface';

/**
 * Caso de uso para obtener las estadísticas de un jugador en todos los torneos
 */
export class GetPlayerAllTournamentsStatisticsUseCase implements IUseCase<GetPlayerAllTournamentsStatisticsDto, Statistic[]> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly userRepository: IUserRepository
  ) {}

  /**
   * Ejecuta el caso de uso
   * @param data Datos para obtener las estadísticas
   * @returns Resultado con las estadísticas del jugador en todos los torneos o un error
   */
  async execute(data: GetPlayerAllTournamentsStatisticsDto): Promise<Result<Statistic[]>> {
    try {
      // Verificar si el jugador existe
      const player = await this.userRepository.findById(data.playerId);
      if (!player) {
        return Result.fail<Statistic[]>(new Error('El jugador no existe'));
      }

      // Obtener todas las estadísticas del jugador
      const statistics = await this.statisticRepository.findByPlayer(data.playerId);

      return Result.ok<Statistic[]>(statistics);
    } catch (error: any) {
      return Result.fail<Statistic[]>(new Error(`Error al obtener las estadísticas del jugador: ${error.message}`));
    }
  }
} 