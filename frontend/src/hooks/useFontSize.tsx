
import { useState, useEffect } from 'react';

export function useFontSize() {
  // Estado para almacenar el tamaño de fuente actual
  const [fontSize, setFontSize] = useState<number>(() => {
    // Intentar recuperar del localStorage al inicializar
    const savedFontSize = localStorage.getItem('fontSize');
    return savedFontSize ? parseInt(savedFontSize, 10) : 16; // Valor predeterminado: 16px
  });

  // Efecto para aplicar el tamaño de fuente al documento
  useEffect(() => {
    // Aplicar al elemento raíz para que afecte a toda la aplicación
    document.documentElement.style.fontSize = `${fontSize}px`;
    
    // Guardar en localStorage
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  return { fontSize, setFontSize };
}
