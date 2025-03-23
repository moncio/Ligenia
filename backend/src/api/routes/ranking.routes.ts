import { Router } from 'express';
import { RankingController } from '../controllers/statistic.controller';
import { validateParams, validateQuery } from '../middlewares/validate.middleware';
import { 
  getRankingsQuerySchema 
} from '../validations/statistic.validation';
import { z } from 'zod';
import { PlayerLevel } from '@prisma/client';

const router = Router();
const rankingController = new RankingController();

/**
 * @route GET /api/rankings
 * @desc Get global rankings
 * @access Public
 */
router.get(
  '/',
  validateQuery(getRankingsQuerySchema),
  rankingController.getRankings
);

/**
 * @route GET /api/rankings/:categoryId
 * @desc Get rankings by category
 * @access Public
 */
router.get(
  '/:categoryId',
  validateParams(z.object({
    categoryId: z.nativeEnum(PlayerLevel, {
      errorMap: () => ({ message: 'Invalid player category' })
    })
  })),
  rankingController.getRankingsByCategory
);

export default router; 