import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Esquema para validar el parámetro ID
export const idParamSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid UUID format'
  })
});

// Esquema para crear un nuevo usuario
export const createUserSchema = z.object({
  email: z.string().email({
    message: 'Invalid email format'
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters'
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters'
  }),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Role must be a valid UserRole' })
  }).optional()
});

// Esquema para actualizar un usuario
export const updateUserSchema = z.object({
  email: z.string().email({
    message: 'Invalid email format'
  }).optional(),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters'
  }).optional(),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Role must be a valid UserRole' })
  }).optional()
});

// Esquema para cambiar contraseña
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, {
    message: 'Current password is required'
  }),
  newPassword: z.string().min(8, {
    message: 'New password must be at least 8 characters'
  })
});

// Esquema para inicio de sesión
export const loginSchema = z.object({
  email: z.string().email({
    message: 'Invalid email format'
  }),
  password: z.string().min(1, {
    message: 'Password is required'
  })
});

// Esquema para registro
export const registerSchema = z.object({
  email: z.string().email({
    message: 'Invalid email format'
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters'
  }),
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters'
  })
});

// Esquema para solicitar restablecimiento de contraseña
export const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: 'Invalid email format'
  })
});

// Esquema para restablecer contraseña
export const resetPasswordSchema = z.object({
  token: z.string().min(1, {
    message: 'Token is required'
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters'
  })
});

// Esquema para verificar email
export const verifyEmailSchema = z.object({
  token: z.string().min(1, {
    message: 'Token is required'
  })
});

// Esquema para refrescar token
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, {
    message: 'Refresh token is required'
  })
}); 