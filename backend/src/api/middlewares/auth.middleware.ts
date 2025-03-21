import { Request, Response, NextFunction } from 'express';
import { IAuthService, IAuthUser } from '../../core/application/interfaces/auth';
import { UserRole } from '@prisma/client';
import { UnauthorizedError } from '../../shared/errors/auth.error';

/**
 * Extended Express Request with user information
 * Adds typed user property to the Express Request object
 */
export interface AuthRequest extends Request {
  user?: IAuthUser;
}

/**
 * Authentication middleware
 * Validates JWT token from Authorization header (Bearer token) and adds user info to request
 * 
 * @param authService - Authentication service implementation
 * @returns Express middleware function
 * @throws Returns 401 Unauthorized if token is missing, invalid, or expired
 * 
 * Usage:
 * ```
 * router.use('/protected-route', authMiddleware(authService), (req, res) => {
 *   // Access user info with req.user
 *   res.json({ user: req.user });
 * });
 * ```
 */
export const authMiddleware = (authService: IAuthService) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: No token provided',
        });
      }

      const token = authHeader.split(' ')[1];
      
      // Validate token
      const result = await authService.validateToken(token);
      
      if (result.isFailure) {
        return res.status(401).json({
          status: 'error',
          message: result.getError().message,
        });
      }

      const { valid, user } = result.getValue();
      
      if (!valid || !user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: Invalid token',
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during authentication',
      });
    }
  };
};

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has one of the allowed roles
 * Must be used after authMiddleware to ensure user info is available
 * 
 * @param roles - Array of allowed role names (e.g., [UserRole.ADMIN])
 * @returns Express middleware function
 * @throws Returns 403 Forbidden if user doesn't have the required role
 * 
 * Usage:
 * ```
 * router.use('/admin',
 *   authMiddleware(authService),
 *   roleMiddleware([UserRole.ADMIN]),
 *   adminController.dashboard
 * );
 * ```
 */
export const roleMiddleware = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      // The role from IAuthUser might be a string, so we need to convert it to UserRole enum
      const userRole = req.user.role as unknown as UserRole;
      const hasRole = roles.includes(userRole);
      
      if (!hasRole) {
        return res.status(403).json({
          status: 'error',
          message: `Forbidden: Access requires one of these roles: ${roles.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during authorization',
      });
    }
  };
};
