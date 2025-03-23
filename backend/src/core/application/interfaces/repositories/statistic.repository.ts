import { Statistic } from '../../../domain/statistic/statistic.entity';

export interface StatisticFilter {
  playerId?: string;
  tournamentId?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export interface StatisticSortOptions {
  field: 'winRate' | 'matchesPlayed' | 'tournamentsWon' | 'averageScore';
  order: 'asc' | 'desc';
}

export interface PaginationOptions {
  skip: number;
  limit: number;
  sort?: StatisticSortOptions;
}

/**
 * Interface for statistics repository
 */
export interface IStatisticRepository {
  /**
   * Find statistic by ID
   */
  findById(id: string): Promise<Statistic | null>;

  /**
   * Find statistic by player ID
   */
  findByPlayerId(playerId: string): Promise<Statistic | null>;

  /**
   * Find statistics by filter with pagination
   */
  findAll(filter?: StatisticFilter, pagination?: PaginationOptions): Promise<Statistic[]>;

  /**
   * Count statistics based on filter
   */
  count(filter?: StatisticFilter): Promise<number>;

  /**
   * Save a new statistic
   */
  save(statistic: Statistic): Promise<void>;

  /**
   * Update an existing statistic
   */
  update(statistic: Statistic): Promise<void>;

  /**
   * Delete a statistic
   */
  delete(id: string): Promise<void>;

  /**
   * Find statistics for players in a tournament
   */
  findByTournamentId(tournamentId: string): Promise<Statistic[]>;
}
