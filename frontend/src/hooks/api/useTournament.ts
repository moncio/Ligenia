import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Tournament, TournamentFilters, TournamentWithStatus, tournamentService } from '@/lib/api/services/tournamentService';
import { ApiError } from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api/client';

// Query key factories
export const tournamentKeys = {
  all: ['tournament'] as const,
  lists: () => [...tournamentKeys.all, 'list'] as const,
  list: (filters?: TournamentFilters) => [...tournamentKeys.lists(), filters] as const,
  details: () => [...tournamentKeys.all, 'detail'] as const,
  detail: (id: string) => [...tournamentKeys.details(), id] as const,
  playerTournaments: () => [...tournamentKeys.all, 'player'] as const,
  bracket: (id: string) => [...tournamentKeys.detail(id), 'bracket'] as const,
};

/**
 * Hook para obtener listado de torneos
 */
export const useTournaments = (
  filters?: TournamentFilters,
  options?: UseQueryOptions<{
    data: {
      tournaments: Tournament[];
      pagination: { total: number; page: number; limit: number };
    }
  }, ApiError>
) => {
  return useQuery({
    queryKey: tournamentKeys.list(filters),
    queryFn: () => tournamentService.getTournaments(filters),
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

/**
 * Hook para obtener torneos del jugador actual
 */
export const useCurrentPlayerTournaments = (
  options?: UseQueryOptions<{ data: { tournaments: TournamentWithStatus[] } }, ApiError>
) => {
  return useQuery({
    queryKey: tournamentKeys.playerTournaments(),
    queryFn: () => tournamentService.getCurrentPlayerTournaments(),
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

/**
 * Hook para obtener detalles de un torneo
 */
export const useTournamentDetails = (
  tournamentId: string,
  options?: UseQueryOptions<{ data: { tournament: Tournament } }, ApiError>
) => {
  return useQuery({
    queryKey: tournamentKeys.detail(tournamentId),
    queryFn: () => tournamentService.getTournamentById(tournamentId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!tournamentId,
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
 * Hook para obtener el bracket de un torneo
 */
export const useTournamentBracket = (
  tournamentId: string,
  options?: UseQueryOptions<{ data: { bracket: any } }, ApiError>
) => {
  return useQuery({
    queryKey: tournamentKeys.bracket(tournamentId),
    queryFn: () => tournamentService.getTournamentBracket(tournamentId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!tournamentId,
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
 * Hook para registrarse en un torneo
 */
export const useRegisterForTournament = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tournamentId: string) => tournamentService.registerForTournament(tournamentId),
    onSuccess: () => {
      // Invalida las consultas para refrescar los datos después de la inscripción
      queryClient.invalidateQueries({ queryKey: tournamentKeys.playerTournaments() });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    }
  });
};

/**
 * Hook para obtener los torneos activos
 */
export const useActiveTournaments = (options?: UseQueryOptions<any, ApiError>) => {
  const auth = useAuth();
  const isLoadingAuth = auth?.loading || false;

  return useQuery({
    queryKey: [...tournamentKeys.all, 'active'],
    queryFn: async () => {
      try {
        // Llamar al endpoint real
        console.log('Fetching active tournaments');
        return tournamentService.getTournaments({ status: 'ACTIVE' });
      } catch (error) {
        console.error('Error fetching active tournaments:', error);
        throw error;
      }
    },
    enabled: !isLoadingAuth,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}; 