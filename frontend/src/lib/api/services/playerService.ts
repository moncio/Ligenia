import { api } from '../client';

export interface Player {
  id: string;
  name: string;
  userId?: string;
  bio?: string;
  avatarUrl?: string;
  level?: string;
  rankingPosition?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: string;
  totalPoints: number;
  averagePointsPerMatch: number;
  currentRanking: number;
  estimatedLevel: string;
}

// Servicio para gestionar jugadores y su información
export const playerService = {
  /**
   * Obtener información del jugador actual (basado en el usuario autenticado)
   */
  getCurrentPlayer: async () => {
    const authUser = await api.get('/api/auth/me');
    const playerId = authUser.data.user.playerId;
    return api.get<{
      data: {
        player: Player;
      }
    }>(`/api/players/${playerId}`);
  },

  /**
   * Obtener información de un jugador por ID
   */
  getPlayerById: async (playerId: string) => {
    return api.get<{
      data: {
        player: Player;
      }
    }>(`/api/players/${playerId}`);
  },

  /**
   * Obtener estadísticas del jugador actual
   */
  getCurrentPlayerStats: async () => {
    const authUser = await api.get('/api/auth/me');
    const playerId = authUser.data.user.playerId;
    return api.get<{
      data: {
        statistics: PlayerStats;
      }
    }>(`/api/statistics/player/${playerId}`);
  },

  /**
   * Actualizar perfil del jugador
   */
  updatePlayerProfile: async (playerId: string, data: Partial<Player>) => {
    return api.put<{
      data: {
        player: Player;
      }
    }>(`/api/players/${playerId}`, data);
  }
}; 