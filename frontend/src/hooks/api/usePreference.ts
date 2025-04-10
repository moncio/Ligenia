import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Preferences, preferenceService } from '@/lib/api/services/preferenceService';
import { ApiError } from '@/lib/api/client';

// Query key factory
export const preferenceKeys = {
  all: ['preference'] as const,
  preferences: () => [...preferenceKeys.all, 'list'] as const,
};

/**
 * Hook to get user preferences
 */
export const usePreferences = (
  options?: UseQueryOptions<{ data: { preferences: Preferences } }, ApiError>
) => {
  // Create preferences object with default values from localStorage
  const storedTheme = localStorage.getItem('theme') || 'light';
  const validTheme = (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') 
    ? storedTheme as 'light' | 'dark' | 'system'
    : 'light';
    
  const defaultPreferences = {
    data: {
      preferences: {
        theme: validTheme,
        fontSize: parseInt(localStorage.getItem('fontSize') || '16', 10)
      } as Preferences
    }
  };

  return useQuery({
    queryKey: preferenceKeys.preferences(),
    queryFn: () => {
      // Always return local preferences to avoid infinite API calls
      return Promise.resolve(defaultPreferences);
    },
    staleTime: Infinity, // Never expires
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    ...options
  });
};

/**
 * Hook to update user preferences
 */
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (preferences: Partial<Preferences>) => {
      // Update localStorage directly instead of API call
      if (preferences.theme) {
        localStorage.setItem('theme', preferences.theme);
      }
      if (preferences.fontSize) {
        localStorage.setItem('fontSize', preferences.fontSize.toString());
      }
      
      // Return a successful mock response
      return Promise.resolve({ 
        data: { 
          preferences: {
            theme: localStorage.getItem('theme') as 'light' | 'dark' | 'system',
            fontSize: parseInt(localStorage.getItem('fontSize') || '16', 10)
          } 
        } 
      });
    },
    onSuccess: () => {
      // Invalidate cache after successful update
      queryClient.invalidateQueries({ queryKey: preferenceKeys.preferences() });
    },
    retry: false,
  });
};

/**
 * Hook to reset user preferences to default values
 */
export const useResetPreferences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => {
      // Reset localStorage to defaults
      localStorage.setItem('theme', 'light');
      localStorage.setItem('fontSize', '16');
      
      // Return a successful mock response
      return Promise.resolve({ 
        data: { 
          preferences: {
            theme: 'light',
            fontSize: 16
          } 
        } 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: preferenceKeys.preferences() });
    },
    retry: false
  });
}; 