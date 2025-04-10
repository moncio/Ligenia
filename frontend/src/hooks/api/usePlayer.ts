import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { Player, PlayerStats, playerService } from '@/lib/api/services/playerService';
import { ApiError } from '@/lib/api/client';
import { api } from '@/lib/api/client';

// Query key factories
export const playerKeys = {
  all: ['player'] as const,
  auth: () => ['auth'] as const,
  currentPlayer: () => [...playerKeys.all, 'current'] as const,
  playerById: (id: string) => [...playerKeys.all, 'detail', id] as const,
  playerStats: (id: string) => [...playerKeys.all, 'stats', id] as const,
};

/**
 * Hook para obtener el usuario autenticado
 */
export const useAuth = (options?: UseQueryOptions<any, ApiError>) => {
  return useQuery({
    queryKey: playerKeys.auth(),
    queryFn: async () => {
      const response = await api.get('/api/auth/me');
      return response.data;
    },
    ...options
  });
};

/**
 * Hook para obtener el jugador actual
 */
export const useCurrentPlayer = (options?: UseQueryOptions<any, ApiError>) => {
  const { data: authData, isLoading: isLoadingAuth } = useAuth();
  const playerId = authData?.user?.playerId;

  return useQuery({
    queryKey: playerKeys.currentPlayer(),
    queryFn: async () => {
      if (!playerId) throw new Error('No playerId available');
      const response = await api.get(`/api/players/${playerId}`);
      return response.data;
    },
    enabled: !!playerId && !isLoadingAuth,
    ...options
  });
};

/**
 * Hook para obtener un jugador por ID
 */
export const usePlayerById = (
  playerId: string,
  options?: UseQueryOptions<any, ApiError>
) => {
  return useQuery({
    queryKey: playerKeys.playerById(playerId),
    queryFn: async () => {
      if (!playerId) throw new Error('No playerId provided');
      const response = await api.get(`/api/players/${playerId}`);
      return response.data;
    },
    enabled: !!playerId,
    ...options
  });
};

/**
 * Hook para obtener estadísticas del jugador actual
 */
export const useCurrentPlayerStats = (options?: UseQueryOptions<any, ApiError>) => {
  const auth = useAuth();
  const isLoadingAuth = auth?.isLoading || false;
  const userId = auth?.data?.user?.id || (import.meta.env.DEV ? 'dev-player-id' : undefined);

  return useQuery({
    queryKey: playerKeys.playerStats(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('No user ID available');
      
      // Llamar al endpoint real
      try {
        console.log(`Fetching player statistics from: /api/statistics/current`);
        const response = await api.get(`/api/statistics/current`);
        return response.data;
      } catch (error) {
        console.error('Error fetching player statistics:', error);
        // Devolver datos por defecto en caso de error
        return {
          status: 'success',
          data: {
            statistics: {
              matchesPlayed: 0,
              wins: 0,
              losses: 0,
              winRate: "0%",
              currentRanking: 0,
              estimatedLevel: "Principiante"
            }
          }
        };
      }
    },
    enabled: !!userId && !isLoadingAuth,
    retry: 1,
    ...options
  });
}; 