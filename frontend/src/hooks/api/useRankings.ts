import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { rankingService, Player } from '@/lib/api/services/rankingService';
import { ApiError, api } from '@/lib/api/client';

// Query key factories
export const rankingKeys = {
  all: ['rankings'] as const,
  global: (filters?: { page: number; limit: number }) => 
    [...rankingKeys.all, 'global', filters] as const,
  globalWithFilters: (page: number, limit: number, search?: string) => 
    [...rankingKeys.global({ page, limit }), { search }] as const,
  category: (category: string) => 
    [...rankingKeys.all, 'category', category] as const,
  categoryWithFilters: (category: string, page: number, limit: number) => 
    [...rankingKeys.category(category), { page, limit }] as const,
  currentUser: () => [...rankingKeys.all, 'me'] as const,
};

// Tipo para la respuesta del ranking del usuario actual
type UserRankingResponse = {
  status: string;
  data: {
    position: number;
    player: {
      id: string;
      name: string;
    };
  };
};

/**
 * Hook to fetch global player rankings
 */
export const useGlobalRankings = (
  page: number = 1, 
  limit: number = 10, 
  search?: string,
  options?: UseQueryOptions<
    { 
      data: { 
        rankings: Player[],
        pagination: { 
          total: number, 
          page: number, 
          limit: number 
        } 
      } 
    },
    ApiError
  >
) => {
  return useQuery({
    queryKey: rankingKeys.global({ page, limit }),
    queryFn: () => rankingService.getGlobalRankings(page, limit, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
};

/**
 * Hook to fetch category-based player rankings
 */
export const useCategoryRankings = (
  category: string,
  page: number = 1, 
  limit: number = 10,
  options?: UseQueryOptions<
    { 
      data: { 
        rankings: Player[],
        pagination: { 
          total: number, 
          page: number, 
          limit: number 
        } 
      } 
    },
    ApiError
  >
) => {
  return useQuery({
    queryKey: rankingKeys.categoryWithFilters(category, page, limit),
    queryFn: () => rankingService.getCategoryRankings(category, page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!category,
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
 * Hook para obtener el ranking del usuario actual
 */
export const useCurrentUserRanking = (
  options?: UseQueryOptions<UserRankingResponse, ApiError>
) => {
  return useQuery({
    queryKey: rankingKeys.currentUser(),
    queryFn: async () => {
      console.log('Fetching current user ranking...');
      
      // Llamar al endpoint real
      try {
        const response = await api.get<UserRankingResponse>('/api/rankings/me');
        console.log('Current user ranking response:', response.data);
        
        // Comprobar valores esperados
        if (!response.data || typeof response.data !== 'object') {
          console.error('Invalid response format:', response.data);
          throw new Error('Invalid response format');
        }
        
        // Verificar que los datos existen en la estructura esperada
        if (response.data.position === null || response.data.position === undefined) {
          console.log('Warning: Position is null or undefined in the ranking data');
        }
        
        if (!response.data.player) {
          console.log('Warning: Player is null in the ranking data');
        }
        
        return {
          status: 'success',
          data: response.data
        };
      } catch (error) {
        console.error('Error fetching current user ranking:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    ...options
  });
}; 