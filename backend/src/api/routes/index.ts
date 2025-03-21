import { Router } from 'express';
import { container } from '../../config/di-container';
import { TYPES } from '../../config/di-container';
import { IAuthService } from '../../core/application/interfaces/auth';
import { authMiddleware, roleMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import authRoutes from './auth.routes';

// Create main router
const router = Router();

// Get services from container
const authService = container.get<IAuthService>(TYPES.AuthService);

// Public routes
router.use('/auth', authRoutes(authService));

// Health check - public
router.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// User profile - requires authentication
router.use('/profile', authMiddleware(authService), (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

// Admin routes - requires ADMIN role
router.use('/admin', 
  authMiddleware(authService), 
  roleMiddleware([UserRole.ADMIN]), 
  (req: AuthRequest, res) => {
    res.json({ message: 'Admin area', user: req.user });
  }
);

// Player routes - requires PLAYER role
router.use('/player', 
  authMiddleware(authService), 
  roleMiddleware([UserRole.PLAYER]), 
  (req: AuthRequest, res) => {
    res.json({ message: 'Player area', user: req.user });
  }
);

// Tournament routes would be added here, protected by auth middleware
// Examples:
// router.use('/tournaments', authMiddleware(authService), tournamentRoutes);
// router.use('/matches', authMiddleware(authService), matchRoutes);

export default router; 