import { api } from '../client';

export interface Player {
  id: string;
  name: string;
  points: number;
  userId?: string;
  rank?: number;
}

// Interfaz para la respuesta del API de rankings
interface RankingsResponse {
  rankings: Array<{
    id: string;
    playerId: string;
    globalPosition: number;
    rankingPoints: number;
    player: {
      id: string;
      name: string;
      level: string;
    };
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Ranking service for handling player rankings
export const rankingService = {
  /**
   * Get global player rankings
   */
  getGlobalRankings: async (page: number = 1, limit: number = 10, search?: string) => {
    try {
      console.log('[rankingService] Getting global rankings with params:', { page, limit, search });
      
      // Calculate offset from page and limit
      const offset = (page - 1) * limit;
      
      // Define the query URL with parameters
      const queryUrl = `/api/rankings/global?limit=${limit}&offset=${offset}`;
      console.log('[rankingService] Requesting URL:', queryUrl);
      
      // Usar el cliente API normal que incluye la gestión del token automáticamente
      const data = await api.get<RankingsResponse>(queryUrl);
      
      // Log the raw response to debug
      console.log('[rankingService] Raw API response data:', JSON.stringify(data, null, 2));
      
      // Check if we have the expected data structure
      if (!data || !data.rankings || !data.pagination) {
        console.error('[rankingService] Unexpected API response format:', data);
        throw new Error('Unexpected API response format');
      }
      
      // Map the API response to the format expected by the UI
      let playerRankings = data.rankings.map(ranking => ({
        id: ranking.playerId,
        name: ranking.player?.name || `Player ${ranking.playerId.substring(0, 8)}`,
        points: ranking.rankingPoints,
        userId: ranking.playerId,
        rank: ranking.globalPosition
      }));
      
      console.log(`[rankingService] Processed ${playerRankings.length} player rankings`);
      
      // Filter by search if provided
      if (search) {
        const beforeFilter = playerRankings.length;
        playerRankings = playerRankings.filter((player) => 
          player.name.toLowerCase().includes(search.toLowerCase())
        );
        console.log(`[rankingService] Applied search filter: ${beforeFilter} -> ${playerRankings.length} results`);
      }
      
      // Construct the formatted response
      const formattedResponse = {
        data: {
          rankings: playerRankings,
          pagination: {
            total: data.pagination.total,
            page: page,
            limit: data.pagination.limit
          }
        }
      };
      
      console.log('[rankingService] Returning formatted response:', JSON.stringify(formattedResponse, null, 2));
      
      return formattedResponse;
    } catch (error) {
      console.error('[rankingService] Failed to get player rankings:', error);
      // Return empty data on error
      return {
        data: {
          rankings: [],
          pagination: {
            total: 0,
            page,
            limit
          }
        }
      };
    }
  },
  
  /**
   * Get category rankings
   */
  getCategoryRankings: async (category: string, page: number = 1, limit: number = 10) => {
    try {
      console.log('[rankingService] Getting category rankings with params:', { category, page, limit });
      
      // Define the query URL with parameters
      const queryUrl = `/api/rankings/category/${category}?page=${page}&limit=${limit}`;
      console.log('[rankingService] Requesting URL:', queryUrl);
      
      // Usar el cliente API normal que incluye la gestión del token automáticamente
      const data = await api.get(queryUrl);
      
      console.log('[rankingService] Category rankings response:', JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      console.error('[rankingService] Failed to get category rankings:', error);
      throw error;
    }
  },

  /**
   * Get current authenticated user's ranking position
   */
  getCurrentUserRanking: async () => {
    try {
      console.log('[rankingService] Getting current user ranking position');
      
      // Use the new endpoint
      const response = await api.get<{
        status: string;
        data: {
          position: number | null;
          player: {
            id: string;
            name: string;
          } | null;
        }
      }>('/api/rankings/me');
      
      console.log('[rankingService] Current user ranking response:', JSON.stringify(response, null, 2));
      
      return response;
    } catch (error) {
      console.error('[rankingService] Failed to get current user ranking:', error);
      throw error;
    }
  }
}; 