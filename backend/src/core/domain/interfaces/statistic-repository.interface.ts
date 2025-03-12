import { Statistic } from '../entities/statistic.entity';
import { IPaginatedRepository } from './repository.interface';

/**
 * Interfaz para el repositorio de estadísticas
 */
export interface IStatisticRepository extends IPaginatedRepository<Statistic, string> {
  /**
   * Busca estadísticas por jugador
   */
  findByPlayer(playerId: string): Promise<Statistic[]>;

  /**
   * Busca estadísticas por torneo
   */
  findByTournament(tournamentId: string): Promise<Statistic[]>;

  /**
   * Busca estadísticas por jugador y torneo
   */
  findByPlayerAndTournament(playerId: string, tournamentId: string): Promise<Statistic | null>;
} 