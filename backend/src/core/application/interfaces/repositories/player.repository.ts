import { Player } from '../../../domain/player/player.entity';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';

export interface PlayerFilter {
  userId?: string;
  level?: PlayerLevel;
  country?: string;
  searchTerm?: string;
}

export interface PaginationOptions {
  skip: number;
  limit: number;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export interface IPlayerRepository {
  /**
   * Find player by ID
   */
  findById(id: string): Promise<Player | null>;

  /**
   * Find player by user ID
   */
  findByUserId(userId: string): Promise<Player | null>;

  /**
   * Find players by filter with pagination
   */
  findAll(filter?: PlayerFilter, pagination?: PaginationOptions): Promise<Player[]>;

  /**
   * Count players based on filter
   */
  count(filter?: PlayerFilter): Promise<number>;

  /**
   * Find players by level
   */
  findByLevel(level: PlayerLevel): Promise<Player[]>;

  /**
   * Save a new player
   */
  save(player: Player): Promise<void>;

  /**
   * Update an existing player
   */
  update(player: Player): Promise<void>;

  /**
   * Delete a player
   */
  delete(id: string): Promise<void>;
}
