import { PrismaClient } from '@prisma/client';
import { 
  IRepository, 
  IPaginatedRepository, 
  PaginationOptions, 
  PaginatedResult 
} from '../../../core/domain/interfaces/repository.interface';
import { prisma } from '../prisma/client';

/**
 * Clase base para repositorios que utilizan Prisma
 */
export abstract class BaseRepository<T, ID> implements IRepository<T, ID> {
  protected prisma: PrismaClient;
  protected abstract modelName: string;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * Encuentra una entidad por su ID
   */
  abstract findById(id: ID): Promise<T | null>;

  /**
   * Encuentra todas las entidades
   */
  abstract findAll(): Promise<T[]>;

  /**
   * Crea una nueva entidad
   */
  abstract create(data: Omit<T, 'id'>): Promise<T>;

  /**
   * Actualiza una entidad existente
   */
  abstract update(id: ID, data: Partial<T>): Promise<T | null>;

  /**
   * Elimina una entidad
   */
  abstract delete(id: ID): Promise<boolean>;
}

/**
 * Clase base para repositorios con paginación
 */
export abstract class BasePaginatedRepository<T, ID> 
  extends BaseRepository<T, ID> 
  implements IPaginatedRepository<T, ID> {
  
  /**
   * Encuentra todas las entidades con paginación
   */
  abstract findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<T>>;
} 