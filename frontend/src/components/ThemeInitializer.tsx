import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useFontSize } from '@/hooks/useFontSize';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Component that initializes theme and font size from localStorage
 * Must be used inside the QueryClientProvider
 */
export function ThemeInitializer() {
  // Get authentication state
  const { user } = useAuth();
  
  // Initialize theme and font size with localStorage values
  const { theme } = useTheme();
  const { fontSize } = useFontSize();
  
  // This component doesn't render anything, it just initializes and manages themes
  return null;
} 