/**
 * @jest-environment node
 */

import { Request, Response, NextFunction } from 'express';
import {
  authenticate,
  authorize,
  AuthRequest,
} from '../../../../src/api/middlewares/auth.middleware';
import { UserRole } from '@prisma/client';

describe('Auth Middleware Unit Tests', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call next() when valid token is provided', async () => {
      // Setup
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      // Execute
      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest).toHaveProperty('user');
      expect(mockRequest.user).toHaveProperty('id');
      expect(mockRequest.user).toHaveProperty('email');
      expect(mockRequest.user).toHaveProperty('role');
    });

    it('should return 401 when no token is provided', async () => {
      // Execute
      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Authentication token is missing'),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when invalid token is provided', async () => {
      // Setup
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      // Execute
      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('Invalid or expired token'),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle admin tokens properly', async () => {
      // Setup
      mockRequest.headers = {
        authorization: 'Bearer admin-token',
      };

      // Execute
      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toHaveProperty('role', 'ADMIN');
      expect(mockRequest.user).toHaveProperty('id', 'admin-123');
    });

    it('should support test role override through header', async () => {
      // Setup
      mockRequest.headers = {
        authorization: 'Bearer valid-token',
        'x-test-role': 'ADMIN',
      };

      // Save the existing NODE_ENV
      const originalNodeEnv = process.env.NODE_ENV;
      // Set NODE_ENV to test for this test
      process.env.NODE_ENV = 'test';

      // Execute
      await authenticate(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Restore the original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toHaveProperty('role', 'ADMIN');
    });
  });

  describe('authorize', () => {
    it('should call next() if user has the required role', async () => {
      // Setup
      mockRequest.user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.PLAYER,
      };

      const middleware = authorize([UserRole.PLAYER]);

      // Execute
      await middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if user does not have the required role', async () => {
      // Setup
      mockRequest.user = {
        id: 'player-123',
        email: 'player@example.com',
        name: 'Player User',
        role: UserRole.PLAYER,
      };

      const middleware = authorize([UserRole.ADMIN]);

      // Execute
      await middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('You do not have permission'),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should allow access when user has one of multiple allowed roles', async () => {
      // Setup
      mockRequest.user = {
        id: 'player-123',
        email: 'player@example.com',
        name: 'Player User',
        role: UserRole.PLAYER,
      };

      const middleware = authorize([UserRole.ADMIN, UserRole.PLAYER]);

      // Execute
      await middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', async () => {
      // Setup - user is not set
      const middleware = authorize([UserRole.PLAYER]);

      // Execute
      await middleware(
        mockRequest as AuthRequest,
        mockResponse as Response,
        mockNext as NextFunction,
      );

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: expect.stringContaining('User not authenticated'),
        }),
      );
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
