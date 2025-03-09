/**
 * Interfaz genérica para repositorios
 */
export interface IRepository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Omit<T, 'id'>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}

/**
 * Interfaz para opciones de paginación
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Interfaz para resultados paginados
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Interfaz extendida para repositorios con paginación
 */
export interface IPaginatedRepository<T, ID> extends IRepository<T, ID> {
  findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<T>>;
} 