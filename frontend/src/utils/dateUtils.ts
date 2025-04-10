/**
 * Utilidades para el formateo y manipulación de fechas.
 */

/**
 * Formatea una fecha en formato corto (DD/MM/YYYY).
 * @param date - Fecha a formatear (string, Date o undefined)
 * @param options - Opciones de formateo
 * @returns Cadena formateada o "Fecha no disponible" si no hay fecha
 */
export const formatShortDate = (
  date: string | Date | undefined,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }
): string => {
  if (!date) return "Fecha no disponible";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return "Fecha inválida";
    }
    return dateObj.toLocaleDateString('es-ES', options);
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return "Error en formato de fecha";
  }
};

/**
 * Formatea una fecha en formato medio (DD MMM YYYY).
 * @param date - Fecha a formatear (string, Date o undefined)
 * @returns Cadena formateada o "Fecha no disponible" si no hay fecha
 */
export const formatMediumDate = (
  date: string | Date | undefined
): string => {
  return formatShortDate(date, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

/**
 * Formatea una fecha en formato largo (DD de MMMM de YYYY).
 * @param date - Fecha a formatear (string, Date o undefined)
 * @returns Cadena formateada o "Fecha no disponible" si no hay fecha
 */
export const formatLongDate = (
  date: string | Date | undefined
): string => {
  return formatShortDate(date, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Formatea una fecha con hora (DD/MM/YYYY HH:MM).
 * @param date - Fecha a formatear (string, Date o undefined)
 * @param includeSeconds - Si se deben incluir los segundos
 * @returns Cadena formateada o "Fecha no disponible" si no hay fecha
 */
export const formatDateTime = (
  date: string | Date | undefined,
  includeSeconds: boolean = false
): string => {
  if (!date) return "Fecha no disponible";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return "Fecha inválida";
    }
    
    const dateOptions: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {})
    };
    
    const formattedDate = dateObj.toLocaleDateString('es-ES', dateOptions);
    const formattedTime = dateObj.toLocaleTimeString('es-ES', timeOptions);
    
    return `${formattedDate} ${formattedTime}`;
  } catch (error) {
    console.error('Error formateando fecha y hora:', error);
    return "Error en formato de fecha";
  }
};

/**
 * Formatea una hora (HH:MM).
 * @param date - Fecha a formatear (string, Date o undefined)
 * @param includeSeconds - Si se deben incluir los segundos
 * @returns Cadena formateada o "Hora no disponible" si no hay fecha
 */
export const formatTime = (
  date: string | Date | undefined,
  includeSeconds: boolean = false
): string => {
  if (!date) return "Hora no disponible";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return "Hora inválida";
    }
    
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...(includeSeconds ? { second: '2-digit' } : {})
    };
    
    return dateObj.toLocaleTimeString('es-ES', options);
  } catch (error) {
    console.error('Error formateando hora:', error);
    return "Error en formato de hora";
  }
};

/**
 * Devuelve una representación relativa de la fecha (hace X días, en X días)
 * @param date - Fecha a formatear
 * @returns Representación relativa de la fecha
 */
export const formatRelativeTime = (
  date: string | Date | undefined
): string => {
  if (!date) return "Fecha no disponible";
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return "Fecha inválida";
    }
    
    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Hoy
      return "Hoy";
    } else if (diffInDays === 1) {
      // Mañana
      return "Mañana";
    } else if (diffInDays === -1) {
      // Ayer
      return "Ayer";
    } else if (diffInDays > 0 && diffInDays < 7) {
      // En los próximos 7 días
      return `En ${diffInDays} días`;
    } else if (diffInDays < 0 && diffInDays > -7) {
      // En los últimos 7 días
      return `Hace ${Math.abs(diffInDays)} días`;
    } else {
      // Para fechas más lejanas, mostrar la fecha formateada
      return formatMediumDate(dateObj);
    }
  } catch (error) {
    console.error('Error calculando tiempo relativo:', error);
    return "Error en cálculo de fecha";
  }
}; 