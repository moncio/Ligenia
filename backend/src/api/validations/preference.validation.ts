import { z } from 'zod';

// Esquema de validación para parámetros de ID
export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid preference ID format' }),
});

// Esquema de validación para actualización de preferencias
export const updatePreferenceSchema = z.object({
  theme: z
    .enum(['light', 'dark', 'system'], {
      errorMap: () => ({ message: 'Theme must be one of: light, dark, system' }),
    })
    .optional(),
  fontSize: z.number().int().min(10).max(24).optional(),
  // Otras preferencias que puedan aplicar
});

// Esquema de validación para creación de preferencias (generalmente se crean por defecto al crear un usuario)
export const createPreferenceSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  theme: z
    .enum(['light', 'dark', 'system'], {
      errorMap: () => ({ message: 'Theme must be one of: light, dark, system' }),
    })
    .default('system'),
  fontSize: z.number().int().min(10).max(24).default(16),
  // Otras preferencias con valores por defecto
});

// Esquema de validación para resetear preferencias a valores por defecto
export const resetPreferenceSchema = z.object({
  resetAll: z.boolean().optional(),
  resetTheme: z.boolean().optional(),
  resetFontSize: z.boolean().optional(),
  // Otras opciones de reset
});
