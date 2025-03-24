import { Response, NextFunction } from 'express';
import { UserRole } from '../../src/core/domain/user/user.entity';
import { AuthRequest } from '../../src/api/middlewares/auth.middleware';
import jwt from 'jsonwebtoken';

/**
 * Mock authentication middleware for testing
 * This version respects the role in the JWT token
 */
export const mockAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication token is missing',
      });
    }

    const token = authHeader.split(' ')[1];

    // Handle specific test tokens
    if (token === 'invalid-token') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    if (token === 'valid-token') {
      // Default user with PLAYER role
      req.user = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'Test User',
        role: UserRole.PLAYER,
      };
    } else if (token === 'admin-token') {
      // Admin user
      req.user = {
        id: 'admin-123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: UserRole.ADMIN,
      };
    } else {
      // Try to decode JWT token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret-key') as any;

        req.user = {
          id: decoded.sub || 'unknown-id',
          email: decoded.email || 'unknown@example.com',
          name: decoded.name || 'Unknown User',
          role: (decoded.role as UserRole) || UserRole.PLAYER,
        };
      } catch (error) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid or expired token',
        });
      }
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during authentication',
    });
  }
};

/**
 * Mock authorization middleware factory for testing
 */
export const mockAuthorize = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
      }

      // Check if user has required role
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this resource',
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error during authorization',
      });
    }
  };
};

/**
 * Instructions for using this mock in tests:
 *
 * 1. Import the mocked middleware:
 * ```
 * import { mockAuthenticate, mockAuthorize } from '../../mocks/auth-middleware.mock';
 * ```
 *
 * 2. Use jest.mock to replace the actual middleware with the mock:
 * ```
 * jest.mock('../../../src/api/middlewares/auth.middleware', () => ({
 *   authenticate: mockAuthenticate,
 *   authorize: mockAuthorize,
 *   AuthRequest: jest.requireActual('../../../src/api/middlewares/auth.middleware').AuthRequest
 * }));
 * ```
 *
 * 3. In your tests, you can use predefined tokens:
 *    - 'valid-token' - Regular user with PLAYER role
 *    - 'admin-token' - User with ADMIN role
 *    - 'invalid-token' - Will cause authentication to fail
 *    - Or create your own JWT token with custom roles
 */
