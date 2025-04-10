import { Ranking } from '../../../domain/ranking/ranking.entity';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';

/**
 * Interface for the ranking repository
 */
export interface IRankingRepository {
  /**
   * Find ranking by ID
   * @param id Ranking ID
   */
  findById(id: string): Promise<Ranking | null>;

  /**
   * Find ranking by player ID
   * @param playerId Player ID
   */
  findByPlayerId(playerId: string): Promise<Ranking | null>;

  /**
   * Find all rankings
   * @param options Optional filtering options
   */
  findAll(options?: {
    limit?: number;
    offset?: number;
    playerLevel?: PlayerLevel;
    sortBy?: 'rankingPoints' | 'globalPosition';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Ranking[]>;

  /**
   * Count total number of rankings
   * @param options Optional filtering options
   */
  count(options?: { playerLevel?: PlayerLevel }): Promise<number>;

  /**
   * Save a new ranking
   * @param ranking Ranking to save
   */
  save(ranking: Ranking): Promise<void>;

  /**
   * Update an existing ranking
   * @param ranking Ranking to update
   */
  update(ranking: Ranking): Promise<void>;

  /**
   * Delete a ranking
   * @param id Ranking ID to delete
   */
  delete(id: string): Promise<boolean>;

  /**
   * Find rankings by player level
   * @param playerLevel Player level
   * @param options Optional filtering and pagination options
   */
  findByPlayerLevel(
    playerLevel: PlayerLevel,
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: 'rankingPoints' | 'categoryPosition';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<Ranking[]>;

  /**
   * Get the number of players in a category
   * @param playerLevel Player level
   */
  countByPlayerLevel(playerLevel: PlayerLevel): Promise<number>;
}
