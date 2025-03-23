import { Router } from 'express';
import { StatisticController, RankingController } from '../controllers/statistic.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  userIdParamSchema,
  tournamentIdParamSchema,
  createStatisticSchema,
  updateStatisticSchema,
  getStatisticsQuerySchema,
  getRankingsQuerySchema,
} from '../validations/statistic.validation';

const router = Router();
const statisticController = new StatisticController();
const rankingController = new RankingController();

/**
 * @route GET /api/statistics
 * @desc Get all statistics
 * @access Public
 */
router.get('/', validateQuery(getStatisticsQuerySchema), statisticController.getStatistics);

/**
 * @route GET /api/statistics/:id
 * @desc Get statistic by ID
 * @access Public
 */
router.get('/:id', validateParams(idParamSchema), statisticController.getStatisticById);

/**
 * @route POST /api/statistics
 * @desc Create statistic
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateBody(createStatisticSchema),
  statisticController.createStatistic,
);

/**
 * @route PUT /api/statistics/:id
 * @desc Update statistic
 * @access Private - Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateStatisticSchema),
  statisticController.updateStatistic,
);

/**
 * @route DELETE /api/statistics/:id
 * @desc Delete statistic
 * @access Private - Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  statisticController.deleteStatistic,
);

/**
 * @route GET /api/statistics/user/:userId
 * @desc Get statistics for specific user
 * @access Public
 */
router.get(
  '/user/:userId',
  validateParams(userIdParamSchema),
  statisticController.getUserStatistics,
);

/**
 * @route GET /api/statistics/tournament/:tournamentId
 * @desc Get statistics for specific tournament
 * @access Public
 */
router.get(
  '/tournament/:tournamentId',
  validateParams(tournamentIdParamSchema),
  statisticController.getTournamentStatistics,
);

/**
 * @route GET /api/rankings
 * @desc Get rankings
 * @access Public
 */
router.get('/rankings', validateQuery(getRankingsQuerySchema), rankingController.getRankings);

export default router;
