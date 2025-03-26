import { Request, Response, NextFunction } from 'express';
import { container } from '../../config/di-container';
import { TYPES } from '../../config/di-container';
import { IAuthService } from '../../core/application/interfaces/auth-service.interface';
import { User, UserRole } from '../../core/domain/user/user.entity';
import { AppError, ErrorType } from '../../shared/error-handler';

/**
 * Middleware to protect metrics endpoints based on environment and authentication
 * - In development: allow all access
 * - In production: require authentication with admin role
 */
export const protectMetricsEndpoint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // In development, allow access without authentication
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    // In production, require authentication with admin role
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Authentication required to access metrics',
        ErrorType.UNAUTHORIZED,
        401,
        true
      );
    }

    const token = authHeader.split(' ')[1];
    const authService = container.get<IAuthService>(TYPES.AuthService);
    
    // Verify token and get user
    const user = await authService.verifyToken(token);
    if (!user) {
      throw new AppError(
        'Invalid authentication token',
        ErrorType.UNAUTHORIZED,
        401,
        true
      );
    }

    // Check if user has admin role
    if (user.role !== UserRole.ADMIN) {
      throw new AppError(
        'Admin access required to view metrics',
        ErrorType.FORBIDDEN,
        403,
        true
      );
    }

    // Store authenticated user in request for potential later use
    req.user = user as User;
    
    next();
  } catch (error) {
    next(error);
  }
}; 