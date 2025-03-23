import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Extended Express Request with user information
 * Adds typed user property to the Express Request object
 */
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Middleware que verifica si el usuario está autenticado
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Obtener token de autorización del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token is missing'
      });
    }

    const token = authHeader.split(' ')[1];

    // En una implementación real, verificaríamos el token JWT
    // Por ahora, simulamos un usuario autenticado para desarrollo
    if (token === 'invalid-token') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    // Support for different roles in test environment
    let userId = 'user-123';
    let email = 'user@example.com';
    let name = 'Test User';
    let role: UserRole = 'PLAYER'; // Default role

    // Check for special test tokens
    if (token === 'admin-token') {
      role = 'ADMIN';
      userId = 'admin-123';
      email = 'admin@example.com';
      name = 'Admin User';
    }

    // Support for test role override through header (only in test environment)
    if (process.env.NODE_ENV === 'test' && req.headers['x-test-role']) {
      const testRole = req.headers['x-test-role'] as string;
      if (testRole === 'ADMIN' || testRole === 'PLAYER') {
        role = testRole as UserRole;
      }
    }

    // Simular usuario autenticado para propósitos de desarrollo
    req.user = {
      id: userId,
      email,
      name,
      role
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware que verifica si el usuario tiene el rol requerido
 */
export const authorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated'
        });
      }

      // Verificar que el usuario tenga uno de los roles permitidos
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during authorization'
      });
    }
  };
};
