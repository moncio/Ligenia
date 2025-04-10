import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Match, MatchFilters, matchService } from '@/lib/api/services/matchService';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';
import { axiosInstance } from '@/lib/api/axios-instance';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { matchKeys as matchKeysOriginal } from '@/lib/api/query-keys';
import { useSubmitResult } from './useSubmitResult';

// Match type definition
export type MatchType = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  tournamentId: string;
  tournamentName?: string;
  location?: string;
  round?: number;
};

// Query key factories (use the imported ones)
const matchKeys = {
  ...matchKeysOriginal,
  upcoming: (limit?: number) => [...matchKeysOriginal.upcomingMatches(), { limit }]
};

/**
 * Hook para obtener todos los partidos con soporte para paginación y filtros
 */
export const useMatches = (
  page = 1, 
  limit = 10, 
  filters?: { 
    status?: string; 
    tournamentId?: string; 
    date?: string;
  }
) => {
  return useQuery({
    queryKey: matchKeys.list({ page, limit, ...filters }),
    queryFn: async () => {
      // Construir los parámetros de consulta
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Añadir filtros si existen
      if (filters?.status) params.append('status', filters.status);
      if (filters?.tournamentId) params.append('tournamentId', filters.tournamentId);
      if (filters?.date) params.append('date', filters.date);
      
      const response = await api.get(`/api/matches?${params}`);
      return response;
    }
  });
};

/**
 * Hook para obtener los partidos del jugador actualmente autenticado
 * y enriquecerlos con datos de torneos
 */
export const useCurrentPlayerMatches = (
  limit: number = 10, 
  status?: string,
  page: number = 1
) => {
  const auth = useAuth();
  const isAuthenticated = !!auth.user?.id;
  
  // Crear una clave de consulta que incluya todos los parámetros
  const queryKey = [...matchKeys.playerMatches(auth.user?.id || 'guest'), { page, limit, status }];

  return useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      // Si no hay usuario autenticado, devolver un array vacío
      if (!isAuthenticated || !auth.user?.id) {
        return { 
          data: {
            matches: [], 
            pagination: { 
              totalItems: 0, 
              totalPages: 0,
              currentPage: page, 
              limit 
            }
          }
        };
      }
      
      try {
        console.log(`🔍 Fetching matches for user ${auth.user.id} with params:`, {
          page, limit, status, playerId: auth.user.id
        });
        
        // Construir los parámetros de consulta para los partidos
        const matchParams = new URLSearchParams();
        matchParams.append('page', page.toString());
        matchParams.append('limit', limit.toString());
        matchParams.append('playerId', auth.user.id);
        if (status) matchParams.append('status', status);
        
        // Paso 1: Obtener los partidos del usuario para ver si hay datos
        const matchesResponse = await api.get(`/api/matches?${matchParams.toString()}`);
        console.log('🔍 API raw response for matches:', matchesResponse);
        console.log('🔍 API response data for matches:', matchesResponse.data);
        
        // Verificar la estructura de datos
        if (!matchesResponse.data || !matchesResponse.data.data) {
          console.warn('🔍 Unexpected API response structure:', matchesResponse);
          return {
            data: {
              matches: [],
              pagination: {
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
                limit
              }
            }
          };
        }
        
        // Extraer los partidos - manejar posibles estructuras diferentes
        const matches = Array.isArray(matchesResponse.data.data) 
          ? matchesResponse.data.data  // Si data es directamente el array de partidos
          : matchesResponse.data.data.matches // Si data contiene un objeto con matches
            || [];
        
        console.log('🔍 Extracted matches:', matches);
        console.log('🔍 Matches length:', matches.length);
        
        // Si no hay partidos, devolver una estructura vacía
        if (!matches.length) {
          return {
            status: 'success',
            data: {
              matches: [],
              pagination: {
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
                limit
              }
            }
          };
        }
        
        // Paso 2: Obtener la lista de torneos para tener un mapeo de IDs a nombres
        console.log('🔍 Fetching all tournaments to create ID->name mapping');
        let tournamentsMap: Record<string, string> = {};
        
        try {
          const tournamentsResponse = await api.get('/api/tournaments');
          console.log('🔍 Tournaments API response:', tournamentsResponse.data);
          
          // Extraer torneos según estructura
          const tournaments = tournamentsResponse.data?.data?.tournaments 
            || tournamentsResponse.data?.data 
            || [];
          
          // Crear un diccionario con id -> nombre
          tournaments.forEach((tournament: any) => {
            if (tournament.id && tournament.name) {
              tournamentsMap[tournament.id] = tournament.name;
            }
          });
          
          console.log('🔍 Tournaments map created:', tournamentsMap);
        } catch (e) {
          console.warn('🔍 Error fetching tournaments:', e);
          // Si falla, continuamos con un mapa vacío
        }
        
        // Enriquecer los datos de partidos con información de torneos
        const enrichedMatches = matches.map(match => {
          const enrichedMatch = { ...match };
          
          // Añadir información del torneo si está disponible en nuestro mapa
          if (match.tournamentId && tournamentsMap[match.tournamentId]) {
            enrichedMatch.tournamentName = tournamentsMap[match.tournamentId];
          }
          
          return enrichedMatch;
        });
        
        console.log('🔍 Enriched matches:', enrichedMatches);
        
        // Devolver los datos enriquecidos manteniendo la misma estructura
        // que espera el componente Dashboard
        return {
          status: 'success',
          data: {
            matches: enrichedMatches,
            pagination: matchesResponse.data.data.pagination || {
              totalItems: enrichedMatches.length,
              totalPages: 1,
              currentPage: page,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPreviousPage: false
            }
          }
        };
      } catch (error) {
        console.error('🔍 Error fetching player matches or tournaments:', error);
        // En caso de error, devolver datos vacíos
        return {
          status: 'error',
          data: {
            matches: [],
            pagination: {
              totalItems: 0,
              totalPages: 0,
              currentPage: page,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPreviousPage: false
            }
          }
        };
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};

/**
 * Hook para obtener los detalles de un partido específico
 */
export const useMatchDetails = (matchId?: string) => {
  return useQuery({
    queryKey: matchKeys.detail(matchId || ''),
    queryFn: async () => {
      if (!matchId) {
        throw new Error('Match ID is required');
      }
      
      const response = await api.get(`/api/matches/${matchId}`);
      return response;
    },
    enabled: !!matchId
  });
};

/**
 * Hook para obtener los próximos partidos
 */
export const useUpcomingMatches = (limit = 5) => {
  return useQuery({
    queryKey: matchKeys.upcoming(limit),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('status', 'PENDING,IN_PROGRESS');
      params.append('limit', limit.toString());
      params.append('sort', 'date:asc');
      
      const response = await api.get(`/api/matches?${params}`);
      return response;
    }
  });
};

/**
 * Hook para registrar resultado de un partido
 */
export const useSubmitMatchResult = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ matchId, score }: { matchId: string; score: string }) => 
      matchService.submitMatchResult(matchId, score),
    onSuccess: (_, variables) => {
      // Invalida las consultas para refrescar los datos después de actualizar
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.playerMatches() });
    }
  });
};

// Exportamos también el hook para enviar resultados
export { useSubmitResult } from './useSubmitResult';

// Export the match related hooks as a group
const matchHooks = {
  useMatches,
  useCurrentPlayerMatches,
  useMatchDetails,
  useUpcomingMatches,
  useSubmitResult
};

export default matchHooks; 