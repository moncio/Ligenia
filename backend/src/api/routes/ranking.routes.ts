import { Router } from 'express';
import { RankingController } from '../controllers/ranking.controller';
import { validateParams, validateQuery, validateBody } from '../middlewares/validate.middleware';
import { getRankingsQuerySchema } from '../validations/statistic.validation';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { z } from 'zod';
import { PlayerLevel } from '@prisma/client';
import { diMiddleware } from '../middlewares/di.middleware';

const router = Router();
const rankingController = new RankingController();

/**
 * @route GET /api/rankings
 * @desc Get global rankings
 * @access Public
 */
router.get(
  '/',
  diMiddleware,
  validateQuery(getRankingsQuerySchema),
  rankingController.getGlobalRankingList
);

/**
 * @route GET /api/rankings/category/:categoryId
 * @desc Get rankings by category
 * @access Public
 */
router.get(
  '/category/:categoryId',
  diMiddleware,
  validateParams(
    z.object({
      categoryId: z.nativeEnum(PlayerLevel, {
        errorMap: () => ({ message: 'Invalid player category' }),
      }),
    }),
  ),
  rankingController.getCategoryBasedRanking
);

/**
 * @route POST /api/rankings/match/:matchId/update
 * @desc Update rankings after a match has been completed
 * @access Private - Admin
 */
router.post(
  '/match/:matchId/update',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(
    z.object({
      matchId: z.string().uuid({ message: 'Invalid match ID format' }),
    }),
  ),
  rankingController.updateRankingsAfterMatch
);

/**
 * @route POST /api/rankings/calculate
 * @desc Calculate or recalculate player rankings
 * @access Private - Admin
 */
router.post(
  '/calculate',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateBody(
    z.object({
      playerId: z.string().uuid({ message: 'Invalid player ID format' }).optional(),
    }),
  ),
  rankingController.calculatePlayerRankings
);

// For backward compatibility with existing implementations
router.get(
  '/:categoryId',
  diMiddleware,
  validateParams(
    z.object({
      categoryId: z.nativeEnum(PlayerLevel, {
        errorMap: () => ({ message: 'Invalid player category' }),
      }),
    }),
  ),
  rankingController.getCategoryBasedRanking
);

export default router;
