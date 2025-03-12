import { User } from '../entities/user.entity';
import { IPaginatedRepository } from './repository.interface';

/**
 * Interfaz para el repositorio de usuarios
 */
export interface IUserRepository extends IPaginatedRepository<User, string> {
  // Métodos específicos para usuarios si son necesarios
} 