import { api } from '../client';

export interface Preferences {
  theme?: 'light' | 'dark' | 'system';
  fontSize?: number;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
  };
  displaySettings?: {
    showRankings?: boolean;
    matchesPerPage?: number;
  };
}

// Local cache para preferencias
let preferencesCache: {
  data?: {
    preferences: Preferences;
  };
  timestamp?: number;
  retryCount?: number;
  lastAttempt?: number;
} = {};

// Tiempo de vida de la caché: 5 minutos
const CACHE_TTL = 5 * 60 * 1000;
// Tiempo de espera entre reintentos exponencial
const getRetryDelay = (count: number) => Math.min(1000 * Math.pow(2, count), 30000);

// Service for managing user preferences
export const preferenceService = {
  /**
   * Get current user preferences
   */
  getPreferences: async () => {
    const now = Date.now();
    
    // Si tenemos una caché válida, devolverla
    if (preferencesCache.data && 
        preferencesCache.timestamp && 
        now - preferencesCache.timestamp < CACHE_TTL) {
      return { data: preferencesCache.data };
    }
    
    // Control de reintentos para evitar sobrecarga
    if (preferencesCache.lastAttempt && 
        preferencesCache.retryCount && 
        now - preferencesCache.lastAttempt < getRetryDelay(preferencesCache.retryCount)) {
      // Si estamos intentando demasiado rápido, usar la caché aunque haya caducado
      if (preferencesCache.data) {
        console.log('Using stale cache data for preferences - throttling requests');
        return { data: preferencesCache.data };
      }
      
      // Si no hay caché, devolver valores por defecto
      return { 
        data: { 
          preferences: getDefaultPreferences() 
        } 
      };
    }
    
    try {
      // Actualizar timestamp de último intento y contador de reintentos
      preferencesCache.lastAttempt = now;
      preferencesCache.retryCount = (preferencesCache.retryCount || 0) + 1;
      
      // Realizar la petición a la API
      const response = await api.get<{
        data: {
          preferences: Preferences;
        }
      }>('/api/preferences');
      
      // Actualizar cache con la respuesta
      preferencesCache = {
        data: response.data,
        timestamp: now,
        retryCount: 0,
        lastAttempt: now
      };
      
      return response;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      
      // En caso de error, devolver preferencias por defecto o la caché antigua si existe
      if (preferencesCache.data) {
        return { data: preferencesCache.data };
      }
      
      return { 
        data: { 
          preferences: getDefaultPreferences() 
        } 
      };
    }
  },

  /**
   * Update user preferences
   */
  updatePreferences: async (preferences: Partial<Preferences>) => {
    try {
      const response = await api.put<{
        data: {
          preferences: Preferences;
        }
      }>('/api/preferences', preferences);
      
      // Actualizar cache con la respuesta
      preferencesCache = {
        data: response.data,
        timestamp: Date.now(),
        retryCount: 0,
        lastAttempt: Date.now()
      };
      
      return response;
    } catch (error) {
      console.error('Error updating preferences:', error);
      
      // Actualizar la caché local aún en caso de error para mantener coherencia en UI
      if (preferencesCache.data?.preferences) {
        const updatedPreferences = {
          ...preferencesCache.data.preferences,
          ...preferences
        };
        
        preferencesCache = {
          data: { 
            preferences: updatedPreferences 
          },
          timestamp: Date.now(),
          retryCount: (preferencesCache.retryCount || 0) + 1,
          lastAttempt: Date.now()
        };
        
        return { data: preferencesCache.data };
      }
      
      throw error;
    }
  },

  /**
   * Reset user preferences to default values
   */
  resetPreferences: async () => {
    const defaultPreferences = getDefaultPreferences();
    
    try {
      const response = await api.delete<{
        data: {
          preferences: Preferences;
        }
      }>('/api/preferences/reset');
      
      // Actualizar cache con la respuesta
      preferencesCache = {
        data: response.data,
        timestamp: Date.now(),
        retryCount: 0,
        lastAttempt: Date.now()
      };
      
      return response;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      
      // En caso de error, actualizar caché con valores por defecto
      preferencesCache = {
        data: { 
          preferences: defaultPreferences 
        },
        timestamp: Date.now(),
        retryCount: (preferencesCache.retryCount || 0) + 1,
        lastAttempt: Date.now()
      };
      
      return { data: preferencesCache.data };
    }
  }
};

// Helper para obtener preferencias por defecto
function getDefaultPreferences(): Preferences {
  return {
    theme: 'light',
    fontSize: 16,
    language: 'es',
    notifications: {
      email: true,
      push: true
    },
    displaySettings: {
      showRankings: true,
      matchesPerPage: 10
    }
  };
} 