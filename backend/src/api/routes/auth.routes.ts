import { Router } from 'express';
import { IAuthService } from '../../core/application/interfaces/auth';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AuthController } from '../controllers/auth.controller';

// Export a function that receives the auth service and returns the router
export default function authRoutes(authService: IAuthService) {
  const router = Router();
  const authController = new AuthController(authService);

  /**
   * @route POST /api/auth/login
   * @desc Login a user
   * @access Public
   */
  router.post('/login', authController.login);

  /**
   * @route POST /api/auth/register
   * @desc Register a new user
   * @access Public
   */
  router.post('/register', authController.register);

  /**
   * @route POST /api/auth/refresh-token
   * @desc Refresh token
   * @access Public
   */
  router.post('/refresh-token', authController.refreshToken);

  /**
   * @route GET /api/auth/me
   * @desc Get current user
   * @access Private
   */
  router.get('/me', authMiddleware(authService), authController.getCurrentUser);

  /**
   * @route POST /api/auth/logout
   * @desc Logout user
   * @access Public
   */
  router.post('/logout', authController.logout);

  return router;
} 