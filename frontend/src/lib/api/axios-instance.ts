import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create an axios instance with default configuration
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000',
  timeout: 20000, // 20 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add authentication token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      // If there's a session, add the token to the request
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle request timeout
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout:', error.config?.url);
      return Promise.reject(new Error('La solicitud ha tardado demasiado tiempo. Intenta de nuevo más tarde.'));
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject(new Error('Error de conexión. Verifica tu conexión a internet.'));
    }
    
    // Handle 401 (unauthorized) - refresh token or redirect to login
    if (error.response.status === 401) {
      try {
        // Try to refresh the token
        const { error: refreshError } = await supabase.auth.refreshSession();
        
        // If refresh fails, redirect to login
        if (refreshError) {
          console.error('Error refreshing session:', refreshError);
          window.location.href = '/login';
          return Promise.reject(new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'));
        }
        
        // If refresh succeeds, retry the request
        return axiosInstance(error.config);
      } catch (refreshError) {
        console.error('Error refreshing session:', refreshError);
        window.location.href = '/login';
        return Promise.reject(new Error('Error al renovar tu sesión. Por favor, inicia sesión nuevamente.'));
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'Ha ocurrido un error';
    return Promise.reject(new Error(errorMessage));
  }
); 