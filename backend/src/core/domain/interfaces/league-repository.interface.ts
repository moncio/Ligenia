import { League } from '../entities/league.entity';
import { IPaginatedRepository } from './repository.interface';

/**
 * Interfaz para el repositorio de ligas
 */
export interface ILeagueRepository extends IPaginatedRepository<League, string> {
  /**
   * Busca ligas por nombre
   */
  findByName(name: string): Promise<League[]>;

  /**
   * Busca ligas por administrador
   */
  findByAdmin(adminId: string): Promise<League[]>;

  /**
   * Verifica si existe una liga con el mismo nombre
   */
  existsByName(name: string): Promise<boolean>;
} 