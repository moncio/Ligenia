import { Router } from 'express';
import { StatisticController } from '../controllers/statistic.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  userIdParamSchema,
  tournamentIdParamSchema,
  matchIdParamSchema,
  createStatisticSchema,
  updateStatisticSchema,
  getStatisticsQuerySchema,
} from '../validations/statistic.validation';
import { diMiddleware } from '../middlewares/di.middleware';

const router = Router();
const statisticController = new StatisticController();

/**
 * @route GET /api/statistics/player/:playerId
 * @desc Get statistics for a specific player
 * @access Public
 */
router.get(
  '/player/:playerId',
  diMiddleware,
  validateParams(userIdParamSchema),
  statisticController.getPlayerStatistics
);

/**
 * @route GET /api/statistics/tournament/:tournamentId
 * @desc Get statistics for a specific tournament
 * @access Public
 */
router.get(
  '/tournament/:tournamentId',
  diMiddleware,
  validateParams(tournamentIdParamSchema),
  statisticController.getTournamentStatistics
);

/**
 * @route GET /api/statistics/global
 * @desc Get global statistics with pagination and filters
 * @access Public
 */
router.get(
  '/global',
  diMiddleware,
  validateQuery(getStatisticsQuerySchema),
  statisticController.getGlobalStatistics
);

/**
 * @route POST /api/statistics/update/:matchId
 * @desc Update statistics after a match
 * @access Private - Admin
 */
router.post(
  '/update/:matchId',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(matchIdParamSchema),
  statisticController.updateStatisticsAfterMatch
);

// The following routes are for admin functionality

/**
 * @route GET /api/statistics
 * @desc Get all statistics (admin)
 * @access Private - Admin
 */
router.get(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateQuery(getStatisticsQuerySchema),
  statisticController.getStatistics
);

/**
 * @route GET /api/statistics/:id
 * @desc Get statistic by ID (admin)
 * @access Private - Admin
 */
router.get(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  statisticController.getStatisticById
);

/**
 * @route POST /api/statistics
 * @desc Create statistic (admin)
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateBody(createStatisticSchema),
  statisticController.createStatistic
);

/**
 * @route PUT /api/statistics/:id
 * @desc Update statistic (admin)
 * @access Private - Admin
 */
router.put(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateStatisticSchema),
  statisticController.updateStatistic
);

/**
 * @route DELETE /api/statistics/:id
 * @desc Delete statistic (admin)
 * @access Private - Admin
 */
router.delete(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  statisticController.deleteStatistic
);

/**
 * @route GET /api/statistics/user/:userId
 * @desc Get statistics for specific user (deprecated)
 * @access Public
 */
router.get(
  '/user/:userId',
  diMiddleware,
  validateParams(userIdParamSchema),
  statisticController.getUserStatistics
);

export default router;
