
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  // Estado para almacenar el tema actual
  const [theme, setTheme] = useState<Theme>(() => {
    // Intentar recuperar del localStorage al inicializar
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });

  // Efecto para aplicar el tema al documento
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Limpiar clases anteriores
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      // Detectar preferencia del sistema
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemPreference);
    } else {
      // Aplicar tema específico
      root.classList.add(theme);
    }
    
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Efecto para escuchar cambios en la preferencia del sistema
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Función para manejar cambios en la preferencia del sistema
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };
    
    // Añadir listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Limpiar al desmontar
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return { theme, setTheme };
}
