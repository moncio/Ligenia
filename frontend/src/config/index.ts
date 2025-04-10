/**
 * Application configuration from environment variables
 * This file centralizes all environment variable access and validation
 */

interface EnvironmentConfig {
  // API
  apiBaseUrl: string;
  
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  
  // Feature flags
  enableAiAssistant: boolean;
  enableAdvancedStatistics: boolean;
  
  // Performance
  apiCacheTime: number;
  
  // Environment
  environment: 'development' | 'staging' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validate required environment variables
 * Throws an error in production if any are missing
 */
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !import.meta.env[varName]
  );
  
  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    
    if (import.meta.env.PROD) {
      throw new Error(errorMessage);
    }
  }
};

// Validate on module load
validateEnvironmentVariables();

/**
 * Parse boolean environment variables
 */
const parseBooleanEnv = (value: string | undefined, defaultValue: boolean = false): boolean => {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Parse numeric environment variables
 */
const parseNumberEnv = (value: string | undefined, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Application configuration exported as a singleton
 */
export const config: EnvironmentConfig = {
  // API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  
  // Supabase
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Feature flags
  enableAiAssistant: parseBooleanEnv(import.meta.env.VITE_ENABLE_AI_ASSISTANT, true),
  enableAdvancedStatistics: parseBooleanEnv(import.meta.env.VITE_ENABLE_ADVANCED_STATISTICS, true),
  
  // Performance
  apiCacheTime: parseNumberEnv(import.meta.env.VITE_API_CACHE_TIME, 300000), // 5 minutes
  
  // Environment
  environment: (import.meta.env.VITE_ENVIRONMENT || 'development') as 'development' | 'staging' | 'production',
  get isDevelopment() {
    return this.environment === 'development';
  },
  get isProduction() {
    return this.environment === 'production';
  }
};

export default config; 