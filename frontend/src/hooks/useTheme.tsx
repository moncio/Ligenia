import { useEffect, useState } from 'react';

type ThemeType = 'light' | 'dark';

/**
 * Hook to manage the theme of the application.
 * Gets the initial theme from localStorage and updates it as needed.
 * Also listens for system theme changes.
 */
export const useTheme = () => {
  // Initialize from localStorage or system preference or default to 'light'
  const getInitialTheme = (): ThemeType => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme && ['light', 'dark'].includes(storedTheme)) {
        return storedTheme as ThemeType;
      }
      
      // If not in localStorage, use system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  };
  
  const [theme, setTheme] = useState<ThemeType>(getInitialTheme);
  
  // Set theme in DOM and localStorage
  const applyTheme = (newTheme: ThemeType) => {
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };
  
  // Initialize theme on load
  useEffect(() => {
    applyTheme(theme);
  }, []);
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      applyTheme(newTheme);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Function to set the theme
  const setThemeValue = (newTheme: ThemeType) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  
  return { theme, setTheme: setThemeValue };
};
