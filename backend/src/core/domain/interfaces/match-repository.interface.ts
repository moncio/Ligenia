import { Match } from '../entities/match.entity';
import { IPaginatedRepository } from './repository.interface';

/**
 * Interfaz para el repositorio de partidos
 */
export interface IMatchRepository extends IPaginatedRepository<Match, string> {
  /**
   * Busca partidos por torneo
   */
  findByTournament(tournamentId: string): Promise<Match[]>;

  /**
   * Busca partidos por equipo
   */
  findByTeam(teamId: string): Promise<Match[]>;
} 