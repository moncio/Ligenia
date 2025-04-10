import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../useAuth';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { axiosInstance } from '@/lib/api/axios-instance';
import { matchKeys } from '@/lib/api/query-keys';

interface SubmitResultParams {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

/**
 * Hook para enviar el resultado de un partido
 * Realiza validaciones básicas y gestiona las actualizaciones optimistas
 */
export const useSubmitResult = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  return useMutation({
    mutationFn: async ({ matchId, homeScore, awayScore }: SubmitResultParams) => {
      // Validaciones básicas
      if (!matchId || typeof matchId !== 'string') {
        throw new Error('ID de partido inválido');
      }

      if (homeScore < 0 || awayScore < 0) {
        throw new Error('Los puntajes no pueden ser negativos');
      }

      if (!isAuthenticated) {
        throw new Error('Usuario no autenticado');
      }

      // Realizar la petición para actualizar el resultado
      const response = await axiosInstance.patch(
        `${API_ENDPOINTS.MATCHES}/${matchId}/score`,
        {
          homeScore,
          awayScore
        }
      );

      return response.data;
    },

    // Optimistic updates para una mejor experiencia de usuario
    onMutate: async ({ matchId, homeScore, awayScore }) => {
      // Cancelar cualquier consulta en curso
      await queryClient.cancelQueries({ queryKey: matchKeys.detail(matchId) });
      await queryClient.cancelQueries({ queryKey: matchKeys.lists() });
      
      if (user?.id) {
        await queryClient.cancelQueries({ queryKey: matchKeys.playerMatches(user.id) });
      }

      // Guardar el estado anterior para poder revertir en caso de error
      const previousMatchDetails = queryClient.getQueryData(matchKeys.detail(matchId));
      const previousMatches = queryClient.getQueryData(matchKeys.lists());
      const previousPlayerMatches = user?.id 
        ? queryClient.getQueryData(matchKeys.playerMatches(user.id))
        : null;

      // Actualizar optimistamente los datos
      queryClient.setQueryData(matchKeys.detail(matchId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          homeScore,
          awayScore,
          status: 'COMPLETED'
        };
      });

      // Devolver el contexto con los datos anteriores para poder revertir
      return { 
        previousMatchDetails, 
        previousMatches, 
        previousPlayerMatches 
      };
    },

    // En caso de error, revertir a los datos anteriores
    onError: (error, variables, context) => {
      if (context?.previousMatchDetails) {
        queryClient.setQueryData(
          matchKeys.detail(variables.matchId),
          context.previousMatchDetails
        );
      }
      
      if (context?.previousMatches) {
        queryClient.setQueryData(matchKeys.lists(), context.previousMatches);
      }
      
      if (context?.previousPlayerMatches && user?.id) {
        queryClient.setQueryData(
          matchKeys.playerMatches(user.id),
          context.previousPlayerMatches
        );
      }
      
      // Mostrar mensaje de error
      toast.error(
        error instanceof Error 
          ? error.message 
          : 'Error al enviar el resultado del partido'
      );
    },

    // En caso de éxito, invalidar queries para recargar los datos actualizados
    onSuccess: (data, variables) => {
      // Invalidar queries relacionadas para actualizar los datos
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: matchKeys.playerMatches(user.id) });
      }
      
      // Mostrar mensaje de éxito
      toast.success('Resultado del partido enviado correctamente');
    },

    // Configuración de reintentos
    retry: (failureCount, error) => {
      // No reintentar para errores de cliente (4xx)
      if (error instanceof Error && 
          error.message.includes('4')) {
        return false;
      }
      // Limitar a 2 reintentos para otros errores
      return failureCount < 2;
    }
  });
}; 