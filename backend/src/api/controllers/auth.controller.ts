import { Request, Response } from 'express';
import { IAuthService, ILoginCredentials, IRegistrationData } from '../../core/application/interfaces/auth';
import { AuthRequest } from '../middlewares/auth.middleware';

/**
 * Authentication controller
 * Handles authentication-related operations
 */
export class AuthController {
  constructor(private authService: IAuthService) {}

  /**
   * Login a user
   * @route POST /api/auth/login
   * @access Public
   */
  login = async (req: Request, res: Response) => {
    try {
      const credentials: ILoginCredentials = {
        email: req.body.email,
        password: req.body.password,
      };

      const result = await this.authService.login(credentials);

      if (result.isFailure) {
        return res.status(401).json({
          status: 'error',
          message: result.getError().message,
        });
      }

      const { accessToken, refreshToken, user } = result.getValue();

      return res.status(200).json({
        status: 'success',
        data: {
          token: accessToken,
          refreshToken,
          user,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message,
      });
    }
  };

  /**
   * Register a new user
   * @route POST /api/auth/register
   * @access Public
   */
  register = async (req: Request, res: Response) => {
    try {
      const userData: IRegistrationData = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        role: req.body.role,
      };

      const result = await this.authService.register(userData);

      if (result.isFailure) {
        return res.status(400).json({
          status: 'error',
          message: result.getError().message,
        });
      }

      const { accessToken, refreshToken, user } = result.getValue();

      return res.status(201).json({
        status: 'success',
        data: {
          token: accessToken,
          refreshToken,
          user,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message,
      });
    }
  };

  /**
   * Refresh access token
   * @route POST /api/auth/refresh-token
   * @access Public
   */
  refreshToken = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          status: 'error',
          message: 'Refresh token is required',
        });
      }

      const result = await this.authService.refreshToken(refreshToken);

      if (result.isFailure) {
        return res.status(401).json({
          status: 'error',
          message: result.getError().message,
        });
      }

      const { accessToken, refreshToken: newRefreshToken, user } = result.getValue();

      return res.status(200).json({
        status: 'success',
        data: {
          token: accessToken,
          refreshToken: newRefreshToken,
          user,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message,
      });
    }
  };

  /**
   * Get current user info
   * @route GET /api/auth/me
   * @access Private
   */
  getCurrentUser = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: { user: req.user },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: (error as Error).message,
      });
    }
  };

  /**
   * Logout user (client-side)
   * @route POST /api/auth/logout
   * @access Public
   */
  logout = async (req: Request, res: Response) => {
    // JWT tokens are stateless, so we only need to tell the client to remove the token
    // In a real implementation, you might want to blacklist the token or use Redis to track invalidated tokens
    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  };
} 