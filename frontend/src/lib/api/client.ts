import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Validate required environment variables
if (!API_BASE_URL) {
  console.error('Missing required environment variable: VITE_API_BASE_URL');
  if (import.meta.env.PROD) {
    throw new Error('Missing required environment variables for API configuration');
  }
}

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  data?: any;
  
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Token management to prevent multiple simultaneous token refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;
const requestsQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Create an axios instance with default configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL || 'http://localhost:3000',
    timeout: 20000, // Increased timeout to 20s to handle slower DB responses
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(async (config) => {
    try {
      // Check if we already have a token in memory
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        // Set token on request
        config.headers.Authorization = `Bearer ${session.access_token}`;
      } else {
        console.log('⚠️ [API Client] No active session');
      }
      
      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      // Let the request proceed without token
      return config;
    }
  });

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig;
      
      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401 && originalRequest) {
        console.log('🔄 [API Client] 401 error detected');
        
        // Implement token refresh queue to prevent multiple refresh attempts
        if (!isRefreshing) {
          console.log('🔄 [API Client] Starting token refresh');
          isRefreshing = true;
          refreshPromise = supabase.auth.refreshSession()
            .then(({ data, error: refreshError }) => {
              if (refreshError || !data.session) {
                throw new Error('Failed to refresh session');
              }
              return data.session.access_token;
            })
            .finally(() => {
              isRefreshing = false;
              refreshPromise = null;
            });
        }
        
        try {
          // Wait for the token refresh (or use existing refresh promise)
          const newToken = await refreshPromise;
          
          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return client(originalRequest);
        } catch (refreshError) {
          console.error('❌ [API Client] Session refresh failed:', refreshError);
          
          // Navigate to home page on auth failure
          setTimeout(() => {
            window.location.href = '/';
          }, 100);
          
          return Promise.reject(new ApiError('Session expired. Please sign in again.', 401));
        }
      }

      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED') {
        console.error('🕒 [API Client] Request timeout', originalRequest?.url);
        return Promise.reject(new ApiError('Request timed out. The server is experiencing high load.', 408));
      }

      // Handle network errors
      if (!error.response) {
        console.error('🌐 [API Client] Network error', error);
        return Promise.reject(new ApiError('Network error. Please check your connection.', 0));
      }

      // Transform error to consistent format
      const status = error.response?.status || 500;
      
      // Safely extract message from response data
      let errorMessage = 'An unexpected error occurred';
      if (error.response?.data && typeof error.response.data === 'object') {
        errorMessage = (error.response.data as any).message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      const responseData = error.response?.data;
      
      throw new ApiError(errorMessage, status, responseData);
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

// Helper methods with built-in response caching for GET requests
const cache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 60000; // 1 minute cache TTL

export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => {
    const cacheKey = `${url}${config ? JSON.stringify(config) : ''}`;
    const cachedResponse = cache.get(cacheKey);
    const now = Date.now();
    
    // Return cached response if valid
    if (cachedResponse && now - cachedResponse.timestamp < CACHE_TTL) {
      return Promise.resolve(cachedResponse.data);
    }
    
    return apiClient.get<T>(url, config)
      .then(response => {
        // Cache the response
        cache.set(cacheKey, {
          data: response.data,
          timestamp: now
        });
        return response.data;
      });
  },
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.post<T>(url, data, config).then(response => response.data),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.put<T>(url, data, config).then(response => response.data),
  
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) => 
    apiClient.patch<T>(url, data, config).then(response => response.data),
  
  delete: <T>(url: string, config?: AxiosRequestConfig) => 
    apiClient.delete<T>(url, config).then(response => response.data)
}; 