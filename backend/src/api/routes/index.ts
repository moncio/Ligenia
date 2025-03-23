import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import tournamentRoutes from './tournament.routes';
import matchRoutes from './match.routes';
import playerRoutes from './player.routes';
import statisticRoutes from './statistic.routes';
import rankingRoutes from './ranking.routes';
import preferenceRoutes from './preference.routes';
import performanceRoutes from './performance.routes';

// Create main router
const router = Router();

// Health check - public
router.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Entity routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/matches', matchRoutes);
router.use('/players', playerRoutes);
router.use('/statistics', statisticRoutes);
router.use('/rankings', rankingRoutes);
router.use('/preferences', preferenceRoutes);
router.use('/performance', performanceRoutes);

export default router;
