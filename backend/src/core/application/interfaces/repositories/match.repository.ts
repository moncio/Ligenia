import { Match, MatchStatus } from '../../../domain/match/match.entity';

export interface MatchFilter {
  tournamentId?: string;
  userId?: string;
  round?: number;
  status?: MatchStatus;
  fromDate?: Date;
  toDate?: Date;
  limit?: number;
  offset?: number;
}

export interface IMatchRepository {
  /**
   * Find match by ID
   */
  findById(id: string): Promise<Match | null>;

  /**
   * Find matches by filter
   */
  findByFilter(filter: MatchFilter): Promise<Match[]>;

  /**
   * Find matches by tournament ID and round
   */
  findByTournamentAndRound(tournamentId: string, round: number): Promise<Match[]>;

  /**
   * Find matches by player ID
   */
  findByPlayerId(playerId: string): Promise<Match[]>;

  /**
   * Save match
   */
  save(match: Match): Promise<void>;

  /**
   * Delete match
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if tournament has any matches
   */
  tournamentHasMatches(tournamentId: string): Promise<boolean>;

  /**
   * Count matches based on filter
   */
  count(filter: MatchFilter): Promise<number>;
} 