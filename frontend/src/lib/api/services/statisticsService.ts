import { api } from '../client';

export interface PlayerStatistics {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPoints: number;
  averagePointsPerMatch: number;
}

export interface GlobalStatisticsParams {
  timeframe?: 'day' | 'week' | 'month' | 'year' | 'all';
  category?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PROFESSIONAL';
}

export interface Player {
  id: string;
  name: string;
  points: number;
  userId?: string;
  rank?: number;
}

// Statistics service for handling player and tournament statistics
export const statisticsService = {
  /**
   * Get statistics for a specific player
   */
  getPlayerStatistics: async (playerId: string) => {
    return api.get<{
      data: {
        statistics: PlayerStatistics;
      }
    }>(`/api/players/${playerId}/statistics`);
  },
  
  /**
   * Get global platform statistics
   */
  getGlobalStatistics: async (params?: GlobalStatisticsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.timeframe) queryParams.append('timeframe', params.timeframe);
    if (params?.category) queryParams.append('category', params.category);
    
    return api.get<{
      data: {
        totalPlayers: number;
        totalTournaments: number;
        totalMatches: number;
        averageMatchesPerPlayer: number;
        topRankedPlayers: Player[];
      }
    }>(`/api/statistics/global?${queryParams.toString()}`);
  },
  
  /**
   * Get tournament statistics
   */
  getTournamentStatistics: async (tournamentId: string) => {
    return api.get<{
      data: {
        statistics: {
          totalMatches: number;
          completedMatches: number;
          averagePointsPerMatch: number;
          topScorers: {
            playerId: string;
            playerName: string;
            points: number;
          }[];
        }
      }
    }>(`/api/statistics/tournament/${tournamentId}`);
  },
  
  /**
   * Get player performance history (for charts)
   */
  getPlayerPerformanceHistory: async (playerId: string, year: string) => {
    return api.get<{
      data: {
        performanceData: {
          month: string;
          victories: number;
          defeats: number;
        }[];
      }
    }>(`/api/performance/player/${playerId}/history?year=${year}`);
  },
  
  /**
   * Get player match history
   */
  getPlayerMatchHistory: async (playerId: string, year?: string) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    
    return api.get<{
      data: {
        matches: {
          id: string;
          date: string;
          opponent: string;
          result: string;
          score: string;
          tournament: string;
          round: string;
        }[];
      }
    }>(`/api/players/${playerId}/matches?${params.toString()}`);
  }
}; 