import { api } from '../client';

export interface Match {
  id: string;
  tournamentId: string;
  tournamentName?: string;
  player1Id: string; // Equivalente a homePlayerOneId
  player1Name?: string; // Equivalente a homePlayerOneName
  player2Id: string; // Equivalente a awayPlayerOneId
  player2Name?: string; // Equivalente a awayPlayerOneName
  round: number;
  matchNumber?: number;
  scheduledTime?: string; // Equivalente a date
  score?: string; // Representación formateada de homeScore-awayScore
  winner?: string; // ID del jugador ganador, derivado de homeScore y awayScore
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; // Status del backend
  createdAt?: string;
  updatedAt?: string;
  // Campos adicionales del backend
  homePlayerOneId?: string;
  homePlayerTwoId?: string;
  homePlayerOneName?: string; // Nombre del jugador 1 del equipo local
  homePlayerTwoName?: string; // Nombre del jugador 2 del equipo local
  awayPlayerOneId?: string;
  awayPlayerTwoId?: string;
  awayPlayerOneName?: string; // Nombre del jugador 1 del equipo visitante
  awayPlayerTwoName?: string; // Nombre del jugador 2 del equipo visitante
  date?: string;
  location?: string;
  homeScore?: number;
  awayScore?: number;
}

export interface MatchFilters {
  page?: number;
  limit?: number;
  tournamentId?: string;
  playerId?: string;
  status?: string;
}

// Servicio para gestionar partidos
export const matchService = {
  /**
   * Obtener listado de partidos con filtros
   */
  getMatches: async (filters?: MatchFilters) => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.tournamentId) params.append('tournamentId', filters.tournamentId);
    if (filters?.playerId) params.append('playerId', filters.playerId);
    if (filters?.status) params.append('status', filters.status);
    
    console.log('🔎 [matchService.getMatches] Iniciando petición con parámetros:', params.toString());
    
    try {
      const response = await api.get<{
        data: {
          matches: Match[];
          pagination: {
            total: number;
            page: number;
            limit: number;
          }
        }
      }>(`/api/matches?${params.toString()}`);
      
      console.log('🔎 [matchService.getMatches] Respuesta exitosa:', response.data);
      return response;
    } catch (error) {
      console.error('🔎 [matchService.getMatches] Error en petición:', error);
      throw error;
    }
  },

  /**
   * Obtener partidos recientes del jugador actual
   */
  getCurrentPlayerMatches: async (limit: number = 5) => {
    console.log('🔎 [matchService.getCurrentPlayerMatches] Iniciando petición con limit:', limit);
    
    try {
      const response = await api.get<{
        data: {
          matches: Match[];
        }
      }>(`/api/players/me/matches?limit=${limit}`);
      
      console.log('🔎 [matchService.getCurrentPlayerMatches] Respuesta exitosa:', response.data);
      return response;
    } catch (error) {
      console.error('🔎 [matchService.getCurrentPlayerMatches] Error en petición:', error);
      throw error;
    }
  },
  
  /**
   * Obtener un partido por ID
   */
  getMatchById: async (matchId: string) => {
    console.log('🔎 [matchService.getMatchById] Iniciando petición para ID:', matchId);
    
    try {
      const response = await api.get<{
        data: {
          match: Match;
        }
      }>(`/api/matches/${matchId}`);
      
      console.log('🔎 [matchService.getMatchById] Respuesta exitosa:', response.data);
      return response;
    } catch (error) {
      console.error('🔎 [matchService.getMatchById] Error en petición:', error);
      throw error;
    }
  },
  
  /**
   * Obtener próximos partidos del jugador actual
   */
  getUpcomingMatches: async (limit: number = 5) => {
    console.log('🔎 [matchService.getUpcomingMatches] Iniciando petición con limit:', limit);
    
    try {
      const response = await api.get<{
        data: {
          matches: Match[];
        }
      }>(`/api/players/me/matches/upcoming?limit=${limit}`);
      
      console.log('🔎 [matchService.getUpcomingMatches] Respuesta exitosa:', response.data);
      return response;
    } catch (error) {
      console.error('🔎 [matchService.getUpcomingMatches] Error en petición:', error);
      throw error;
    }
  },
  
  /**
   * Registrar resultado de un partido (para usuarios autorizados)
   */
  submitMatchResult: async (matchId: string, score: string) => {
    console.log('🔎 [matchService.submitMatchResult] Iniciando petición para ID:', matchId, 'con score:', score);
    
    try {
      const response = await api.put<{
        data: {
          match: Match;
        }
      }>(`/api/matches/${matchId}/score`, { score });
      
      console.log('🔎 [matchService.submitMatchResult] Respuesta exitosa:', response.data);
      return response;
    } catch (error) {
      console.error('🔎 [matchService.submitMatchResult] Error en petición:', error);
      throw error;
    }
  }
}; 