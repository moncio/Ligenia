import { Tournament } from '../entities/tournament.entity';
import { IPaginatedRepository } from './repository.interface';

/**
 * Interfaz para el repositorio de torneos
 */
export interface ITournamentRepository extends IPaginatedRepository<Tournament, string> {
  /**
   * Busca torneos por liga
   */
  findByLeague(leagueId: string): Promise<Tournament[]>;

  /**
   * Verifica si existe un torneo con el mismo nombre en la misma liga
   */
  existsByNameInLeague(name: string, leagueId: string): Promise<boolean>;
} 