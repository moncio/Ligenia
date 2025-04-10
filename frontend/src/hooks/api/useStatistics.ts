import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { statisticsService, GlobalStatisticsParams } from '@/lib/api/services/statisticsService';
import { ApiError } from '@/lib/api/client';
import { api } from '@/lib/api/client';
import { 
  StatisticsResponse, 
  MatchHistoryResponse, 
  PerformanceHistoryResponse 
} from '@/types/statistics';
import { transformPlayerStatistics } from '@/utils/dataTransformer';
import { useAuth } from '@/contexts/AuthContext';

// Query key factories
export const statisticsKeys = {
  all: ['statistics'] as const,
  player: (playerId: string) => 
    [...statisticsKeys.all, 'player', playerId] as const,
  playerMatches: (playerId: string, year?: string) => 
    [...statisticsKeys.player(playerId), 'matches', { year }] as const,
  playerPerformance: (playerId: string, year: string) => 
    [...statisticsKeys.player(playerId), 'performance', { year }] as const,
  global: (params?: GlobalStatisticsParams) => 
    [...statisticsKeys.all, 'global', params] as const,
  tournament: (tournamentId: string) => 
    [...statisticsKeys.all, 'tournament', tournamentId] as const,
  user: (userId: string) => 
    [...statisticsKeys.all, 'user', userId] as const,
};

// Añadir este tipo para las estadísticas del usuario
export interface UserStatistics {
  totalMatches: number;
  wins: number;
  losses: number;
  totalPoints: number;
  currentRanking: number;
  winRate: string;
  estimatedLevel: string;
  averagePointsPerMatch: string;
}

export interface UserStatisticsResponse {
  status: string;
  data: {
    userId: string;
    statistics: UserStatistics;
  };
}

/**
 * Hook to fetch player statistics
 */
export const usePlayerStatistics = (
  playerId: string,
  options?: UseQueryOptions<StatisticsResponse, ApiError>
) => {
  return useQuery({
    queryKey: statisticsKeys.player(playerId || 'default'),
    queryFn: async () => {
      if (!playerId) throw new Error('No playerId provided');
      
      try {
        const response = await api.get(`/api/players/${playerId}/statistics`);
        const responseData = (response as any).data;
        console.log('Raw API response:', responseData);
        
        // Validate response data
        if (!responseData) {
          console.warn('Empty response received');
          // Return a default empty response structure
          return {
            status: 'success',
            data: {
              statistics: {
                totalMatches: 0,
                wins: 0,
                losses: 0,
                totalPoints: 0,
                currentRanking: 0,
                winRate: 0,
                estimatedLevel: 'P3',
                averagePointsPerMatch: 0
              }
            }
          } as unknown as StatisticsResponse;
        }

        // Check if we have statistics data
        const statsArray = responseData?.data?.statistics || [];
        
        // Transform statistics data from array to aggregated object
        const transformedStats = transformPlayerStatistics(statsArray);
        console.log('Transformed statistics:', transformedStats);
        
        // Create response object matching expected interface
        const transformedResponse: StatisticsResponse = {
          status: responseData.status || 'success',
          data: {
            statistics: transformedStats as any
          }
        };
        
        return transformedResponse;
      } catch (error) {
        console.error('Error fetching player statistics:', error);
        throw error;
      }
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
};

/**
 * Hook to fetch global statistics
 */
export const useGlobalStatistics = (
  params?: GlobalStatisticsParams,
  options?: UseQueryOptions<{ data: any }, ApiError>
) => {
  return useQuery({
    queryKey: statisticsKeys.global(params),
    queryFn: () => statisticsService.getGlobalStatistics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
};

/**
 * Hook to fetch player match history
 */
export const usePlayerMatchHistory = (
  playerId: string,
  year?: string,
  options?: UseQueryOptions<MatchHistoryResponse, ApiError>
) => {
  return useQuery<MatchHistoryResponse, ApiError>({
    queryKey: statisticsKeys.playerMatches(playerId, year),
    queryFn: async () => {
      if (!playerId) throw new Error('No playerId provided');
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      params.append('playerId', playerId);
      params.append('status', 'COMPLETED');
      params.append('limit', '100');
      
      const response = await api.get(`/api/matches?${params.toString()}`);
      const responseData = (response as any).data;
      
      // Wrap raw data in the expected format if necessary
      if (!responseData.status || !responseData.data) {
        return {
          status: 'success',
          data: {
            matches: responseData.matches || []
          }
        };
      }
      
      return responseData as MatchHistoryResponse;
    },
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

/**
 * Hook to fetch player performance history (for charts)
 */
export const usePlayerPerformanceHistory = (
  playerId: string,
  year: string,
  options?: UseQueryOptions<PerformanceHistoryResponse, ApiError>
) => {
  return useQuery<PerformanceHistoryResponse, ApiError>({
    queryKey: statisticsKeys.playerPerformance(playerId, year),
    queryFn: async () => {
      if (!playerId) throw new Error('No playerId provided');
      if (!year) throw new Error('No year provided');
      
      const params = new URLSearchParams();
      params.append('year', year);
      
      const response = await api.get(`/api/performance/player/${playerId}/history?${params.toString()}`);
      const responseData = (response as any).data;
      
      // Wrap raw data in the expected format if necessary
      if (!responseData.status || !responseData.data) {
        return {
          status: 'success',
          data: {
            history: responseData.history || []
          }
        };
      }
      
      return responseData as PerformanceHistoryResponse;
    },
    enabled: !!playerId && !!year,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
};

/**
 * Hook to fetch user statistics
 */
export const useUserStatistics = (
  userId: string,
  options?: UseQueryOptions<StatisticsResponse, ApiError>
) => {
  return useQuery({
    queryKey: statisticsKeys.user(userId || 'default'),
    queryFn: async () => {
      if (!userId) throw new Error('No userId provided');
      
      try {
        const response = await api.get(`/api/users/${userId}/statistics`);
        const responseData = (response as any).data;
        console.log('Raw user statistics response:', responseData);
        
        // Validate response data
        if (!responseData) {
          console.warn('Empty user statistics response received');
          // Return a default empty response structure
          return {
            status: 'success',
            data: {
              statistics: {
                totalMatches: 0,
                wins: 0,
                losses: 0,
                totalPoints: 0,
                currentRanking: 0,
                winRate: 0,
                estimatedLevel: 'P3',
                averagePointsPerMatch: 0
              }
            }
          } as unknown as StatisticsResponse;
        }

        // Create response object matching expected interface
        const transformedResponse: StatisticsResponse = {
          status: responseData.status || 'success',
          data: {
            statistics: {
              totalMatches: responseData?.data?.totalMatches || 0,
              wins: responseData?.data?.wins || 0,
              losses: responseData?.data?.losses || 0,
              totalPoints: responseData?.data?.totalPoints || 0,
              currentRanking: responseData?.data?.currentRanking || 0,
              winRate: responseData?.data?.winRate || 0,
              estimatedLevel: responseData?.data?.estimatedLevel || 'P3',
              averagePointsPerMatch: responseData?.data?.averagePointsPerMatch || 0
            }
          }
        };
        
        console.log('Transformed user statistics:', transformedResponse);
        return transformedResponse;
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
};

/**
 * Hook to fetch current user's statistics for Dashboard
 * 
 * La respuesta del endpoint tiene esta estructura:
 * {
 *   "status": "success",
 *   "data": {
 *     "userId": "5d54bd55-6dce-41fd-84c0-f68e7cf4a9fc",
 *     "statistics": {
 *       "gamesPlayed": 70,
 *       "wins": 37,
 *       "losses": 33,
 *       "winRate": 53,
 *       "averagePoints": 54
 *     }
 *   }
 * }
 */
export const useUserStatisticsForCurrentUser = (
  options?: UseQueryOptions<any, ApiError>
) => {
  const auth = useAuth();
  const userId = auth?.user?.id || (import.meta.env.DEV ? 'dev-user-id' : undefined);
  const isLoadingAuth = auth?.loading || false;

  return useQuery({
    queryKey: [...statisticsKeys.all, 'currentUser', 'statistics'],
    queryFn: async () => {
      if (!userId) throw new Error('No userId available');
      
      try {
        // Llamar al endpoint real
        console.log(`Fetching user statistics from: /api/statistics/${userId}`);
        
        // Obtenemos la respuesta completa sin desestructurar
        const response = await api.get<any>(`/api/statistics/${userId}`);
        console.log('Complete API response:', response);
        console.log('Raw API data:', response.data);
        
        // Devolvemos la respuesta completa con la estructura esperada
        return response.data;
      } catch (error) {
        console.error('Error fetching user statistics:', error);
        return getDefaultUserStats(userId);
      }
    },
    enabled: !!userId && !isLoadingAuth,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options
  });
};

// Función auxiliar para generar estadísticas por defecto
function getDefaultUserStats(userId: string) {
  return {
    status: 'success',
    data: {
      userId: userId,
      statistics: {
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        averagePoints: 0
      }
    }
  };
}

/**
 * Hook to fetch player statistics with mock data
 * This hook will return mock data for a specific player when viewing their profile
 */
export const useMockPlayerStatistics = (
  playerId: string,
  playerName?: string,
  playerRank?: number,
  playerPoints?: number,
  options?: UseQueryOptions<any, ApiError>
) => {
  return useQuery({
    queryKey: [...statisticsKeys.all, 'mock', 'player', playerId],
    queryFn: async () => {
      if (!playerId) throw new Error('No playerId provided');
      
      // Generate random stats based on player ID or use provided data
      const seed = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Use provided data or generate mock data
      const rank = playerRank || (seed % 50) + 1;
      const points = playerPoints || 500 + (seed % 500);
      const matches = 10 + (seed % 40);
      const wins = Math.floor(matches * (0.4 + (seed % 30) / 100));
      const losses = matches - wins;
      const winRate = Math.round((wins / matches) * 100);
      
      // Generate mock monthly performance data
      const currentYear = new Date().getFullYear();
      const monthlyData = [];
      
      for (let month = 0; month < 12; month++) {
        const monthWins = Math.max(0, Math.floor((seed + month) % 6));
        const monthLosses = Math.max(0, Math.floor((seed + month + 2) % 5));
        
        if (monthWins === 0 && monthLosses === 0) continue;
        
        monthlyData.push({
          month: new Date(currentYear, month, 1).toLocaleString('default', { month: 'long' }),
          wins: monthWins,
          losses: monthLosses
        });
      }
      
      // Generate realistic tournament names
      const tournamentNames = [
        "Liga LIGENIA Open P1",
        "Torneo LIGENIA Master Cup",
        "Grand Slam LIGENIA Series",
        "Campeonato LIGENIA Regional P2",
        "Copa LIGENIA de Invierno P1",
        "LIGENIA Championship P2",
        "Open Nacional LIGENIA P3",
        "Torneo Provincial LIGENIA P2",
        "LIGENIA Masters Series",
        "Copa LIGENIA de Verano P1",
        "Torneo LIGENIA Challenger P3",
        "Grand Prix LIGENIA P1"
      ];
      
      // Generate mock match history
      const matchHistory = [];
      const opponents = [
        "García/Martínez", "López/Fernández", "Rodríguez/Pérez", 
        "Sánchez/Díaz", "González/Ruiz", "Hernández/Torres",
        "Ramírez/Flores", "Morales/Ortega", "Castro/Guerrero"
      ];

      // Tournament rounds
      const rounds = [
        "Primera ronda", "Segunda ronda", "Octavos de final", 
        "Cuartos de final", "Semifinal", "Final"
      ];

      for (let i = 0; i < matches; i++) {
        const isWin = i < wins;
        const opponentIndex = (seed + i) % opponents.length;
        
        // Generate more realistic scores for tennis matches
        // First set score
        const firstSetWon = isWin ? (Math.random() > 0.3) : (Math.random() < 0.3);
        const firstSetScoreWinner = firstSetWon ? 6 : Math.floor(Math.random() * 5) + 1;
        const firstSetScoreLoser = firstSetWon ? Math.floor(Math.random() * 4) : 6;
        const firstSet = firstSetWon === isWin 
          ? `${firstSetScoreWinner}-${firstSetScoreLoser}` 
          : `${firstSetScoreLoser}-${firstSetScoreWinner}`;
        
        // Second set score
        const secondSetWon = isWin ? (Math.random() > 0.4) : (Math.random() < 0.4);
        const secondSetScoreWinner = secondSetWon ? 6 : Math.floor(Math.random() * 5) + 1;
        const secondSetScoreLoser = secondSetWon ? Math.floor(Math.random() * 4) : 6;
        const secondSet = secondSetWon === isWin 
          ? `${secondSetScoreWinner}-${secondSetScoreLoser}` 
          : `${secondSetScoreLoser}-${secondSetScoreWinner}`;
        
        // Third set (only played sometimes)
        let thirdSet = null;
        if ((firstSetWon === isWin) !== (secondSetWon === isWin)) {
          const thirdSetWon = isWin; // The winner must win the third set
          const thirdSetScoreWinner = thirdSetWon ? 6 : Math.floor(Math.random() * 5) + 1;
          const thirdSetScoreLoser = thirdSetWon ? Math.floor(Math.random() * 4) : 6;
          thirdSet = thirdSetWon === isWin 
            ? `${thirdSetScoreWinner}-${thirdSetScoreLoser}` 
            : `${thirdSetScoreLoser}-${thirdSetScoreWinner}`;
        }
        
        // Full score with all sets
        const score = thirdSet 
          ? `${firstSet}, ${secondSet}, ${thirdSet}` 
          : `${firstSet}, ${secondSet}`;
        
        // Create match with dates in reverse chronological order (newest first)
        const matchDate = new Date();
        matchDate.setDate(matchDate.getDate() - (i * 3) - Math.floor((seed + i) % 5));
        
        // Select a tournament name based on the seed and match index
        const tournamentNameIndex = (seed + i) % tournamentNames.length;
        
        // Determine round more realistically
        // More recent matches are more likely to be later rounds
        // Distribute the rounds across the match history
        let roundIndex;
        
        if (i < Math.ceil(matches * 0.1)) {
          // 10% of most recent matches might be finals or semifinals
          roundIndex = Math.min(rounds.length - 1, Math.max(rounds.length - 3, Math.floor((seed + i) % 3) + (rounds.length - 3)));
        } else if (i < Math.ceil(matches * 0.3)) {
          // 20% more could be quarterfinals or earlier late rounds
          roundIndex = Math.min(rounds.length - 3, Math.max(2, Math.floor((seed + i) % 3) + 2));
        } else {
          // The rest are earlier rounds
          roundIndex = Math.min(2, Math.floor((seed + i) % 3));
        }
        
        matchHistory.push({
          id: `match-${playerId}-${i}`,
          date: matchDate.toLocaleDateString(),
          opponent: opponents[opponentIndex],
          score: score,
          result: isWin ? 'Victoria' : 'Derrota',
          tournamentName: tournamentNames[tournamentNameIndex],
          round: rounds[roundIndex],
          points: isWin ? 20 + (seed % 10) : 5 + (seed % 5)
        });
      }
      
      return {
        status: 'success',
        data: {
          player: {
            id: playerId,
            name: playerName || `Jugador #${rank}`,
            level: seed % 3 === 0 ? 'P1' : seed % 3 === 1 ? 'P2' : 'P3'
          },
          statistics: {
            totalMatches: matches,
            wins: wins,
            losses: losses,
            totalPoints: points,
            rank: rank,
            winRate: winRate,
            monthlyPerformance: monthlyData,
            matchHistory: matchHistory
          }
        }
      };
    },
    staleTime: Infinity, // Mock data never expires
    ...options
  });
}; 