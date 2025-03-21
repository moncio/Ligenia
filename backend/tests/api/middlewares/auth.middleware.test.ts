import { Request, Response, NextFunction } from 'express';
import { IAuthService, IAuthUser } from '../../../src/core/application/interfaces/auth';
import { authMiddleware, roleMiddleware, AuthRequest } from '../../../src/api/middlewares/auth.middleware';
import { Result } from '../../../src/shared/result';
import { UserRole } from '@prisma/client';
import { UnauthorizedError } from '../../../src/shared/errors/auth.error';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let mockAuthService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    mockRequest = {
      headers: {
        authorization: 'Bearer valid-token',
      },
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    
    nextFunction = jest.fn();
    
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      validateToken: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      refreshToken: jest.fn(),
    } as unknown as jest.Mocked<IAuthService>;
  });

  describe('authMiddleware', () => {
    it('should call next() when token is valid', async () => {
      // Mock user data from token validation
      const mockUser: IAuthUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
        emailVerified: true,
      };

      // Setup validateToken to return success
      mockAuthService.validateToken.mockResolvedValue(
        Result.ok({
          valid: true,
          user: mockUser,
        })
      );

      // Call the middleware
      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert validateToken was called with correct token
      expect(mockAuthService.validateToken).toHaveBeenCalledWith('valid-token');
      
      // Assert user was added to request
      expect((mockRequest as AuthRequest).user).toEqual(mockUser);
      
      // Assert next was called (request continues)
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      // Setup request with no authorization header
      mockRequest.headers = {};

      // Call the middleware
      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized: No token provided',
      });
      
      // Assert next was not called (request stops)
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token validation fails', async () => {
      // Setup validateToken to return failure
      mockAuthService.validateToken.mockResolvedValue(
        Result.fail(new UnauthorizedError())
      );

      // Call the middleware
      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized access',
      });
      
      // Assert next was not called (request stops)
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token is valid but no user is returned', async () => {
      // Setup validateToken to return valid:true but no user
      mockAuthService.validateToken.mockResolvedValue(
        Result.ok({
          valid: true,
          user: undefined,
        })
      );

      // Call the middleware
      await authMiddleware(mockAuthService)(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      // Assert response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Unauthorized: Invalid token',
      });
      
      // Assert next was not called (request stops)
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('roleMiddleware', () => {
    it('should call next() when user has required role', () => {
      // Setup request with authenticated user
      const mockRequest: Partial<AuthRequest> = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: 'ADMIN',
          emailVerified: true,
        },
      };

      // Call the middleware with ADMIN role requirement
      roleMiddleware([UserRole.ADMIN])(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      // Assert next was called (request continues)
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      // Setup request with authenticated user having PLAYER role
      const mockRequest: Partial<AuthRequest> = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: 'PLAYER',
          emailVerified: true,
        },
      };

      // Call the middleware with ADMIN role requirement
      roleMiddleware([UserRole.ADMIN])(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      // Assert response
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Forbidden: Access requires one of these roles: ADMIN',
      });
      
      // Assert next was not called (request stops)
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should allow access when user has one of multiple allowed roles', () => {
      // Setup request with authenticated user having ADMIN role
      const mockRequest: Partial<AuthRequest> = {
        user: {
          id: 'user123',
          email: 'test@example.com',
          role: 'ADMIN',
          emailVerified: true,
        },
      };

      // Call the middleware with multiple allowed roles
      roleMiddleware([UserRole.ADMIN, UserRole.PLAYER])(
        mockRequest as AuthRequest,
        mockResponse as Response,
        nextFunction
      );

      // Assert next was called (request continues)
      expect(nextFunction).toHaveBeenCalled();
    });
  });
}); 