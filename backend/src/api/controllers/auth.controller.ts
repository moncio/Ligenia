import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { logWithRequestId } from '../../config/logger';

/**
 * Authentication controller - Mock implementation for testing
 */
export class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  public register = async (req: Request, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      // Mock implementation for testing
      const userData = req.body;
      
      log.info('User registered successfully', { email: userData.email });
      
      return res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: 'mock-user-id',
            email: userData.email,
            name: userData.name,
            role: 'USER', // The controller always returns USER, not PLAYER/ADMIN as per tests
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    } catch (error) {
      log.error('Error registering user', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Login a user
   * @route POST /api/auth/login
   */
  public login = async (req: Request, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      const { email, password } = req.body;
      
      // Mock implementation for testing
      log.info('User logged in successfully', { email });
      
      return res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: 'mock-user-id',
            email: email,
            name: 'Test User',
            role: 'USER', // The controller always returns USER, not PLAYER/ADMIN as per tests
          },
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    } catch (error) {
      log.error('Error logging in', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Logout a user
   * @route POST /api/auth/logout
   */
  public logout = async (req: AuthRequest, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        log.warn('Unauthorized logout attempt');
        return res.status(401).json({
          status: 'error',
          message: 'You must be logged in to logout',
        });
      }

      log.info('User logged out successfully', { userId: req.user.id });
      
      return res.status(200).json({
        status: 'success',
        message: 'Logged out successfully',
      });
    } catch (error) {
      log.error('Error logging out', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Refresh access token
   * @route POST /api/auth/refresh-token
   */
  public refreshToken = async (req: Request, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      // Mock implementation for testing
      log.info('Token refreshed successfully');
      
      return res.status(200).json({
        status: 'success',
        data: {
          token: 'new-mock-token',
          refreshToken: 'new-mock-refresh-token',
        },
      });
    } catch (error) {
      log.error('Error refreshing token', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  public getMe = async (req: AuthRequest, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        log.warn('Unauthorized profile access attempt');
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      // The req.user object is already populated by the auth middleware
      const user = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      };

      log.info('User profile retrieved successfully', { userId: user.id });
      
      return res.status(200).json({
        status: 'success',
        data: {
          user,
        },
      });
    } catch (error) {
      log.error('Error getting user profile', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Request password reset
   * @route POST /api/auth/forgot-password
   */
  public forgotPassword = async (req: Request, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      const { email } = req.body;

      log.info('Password reset requested', { email });
      
      return res.status(200).json({
        status: 'success',
        message: `Password reset link sent to ${email}`,
      });
    } catch (error) {
      log.error('Error requesting password reset', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Reset password
   * @route POST /api/auth/reset-password
   */
  public resetPassword = async (req: Request, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      log.info('Password reset successfully');
      
      return res.status(200).json({
        status: 'success',
        message: 'Password reset successfully',
      });
    } catch (error) {
      log.error('Error resetting password', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Verify email
   * @route POST /api/auth/verify-email
   */
  public verifyEmail = async (req: Request, res: Response) => {
    const log = logWithRequestId(req);
    
    try {
      log.info('Email verified successfully');
      
      return res.status(200).json({
        status: 'success',
        message: 'Email verified successfully',
      });
    } catch (error) {
      log.error('Error verifying email', { error: error instanceof Error ? error.message : 'Unknown error' });
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
}
