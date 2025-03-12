import { Team } from '../entities/team.entity';
import { IPaginatedRepository } from './repository.interface';

/**
 * Interfaz para el repositorio de equipos
 */
export interface ITeamRepository extends IPaginatedRepository<Team, string> {
  /**
   * Busca equipos por torneo
   */
  findByTournament(tournamentId: string): Promise<Team[]>;

  /**
   * Verifica si existe un equipo con el mismo nombre en el mismo torneo
   */
  existsByNameInTournament(name: string, tournamentId: string): Promise<boolean>;
} 