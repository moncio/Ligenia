import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  // Estado para almacenar el tema actual
  const [theme, setTheme] = useState<Theme>(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });

  // Effect to handle system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(
          mediaQuery.matches ? 'dark' : 'light'
        );
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]);

  // Effect to apply theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // Check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  return {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
  };
}
