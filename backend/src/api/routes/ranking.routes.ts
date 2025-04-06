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
 * @swagger
 * tags:
 *   name: Rankings
 *   description: Player ranking endpoints
 */

/**
 * @swagger
 * /api/rankings:
 *   get:
 *     summary: Get global rankings
 *     description: Retrieve global player rankings with pagination and filters
 *     tags: [Rankings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by player name
 *     responses:
 *       200:
 *         description: List of player rankings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     rankings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           playerId:
 *                             type: string
 *                           points:
 *                             type: number
 *                           player:
 *                             type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 */
router.get(
  '/global',
  authenticate,
  diMiddleware,
  rankingController.getGlobalRankingList
);

/**
 * @swagger
 * /api/rankings/category/:category
 * @desc Get rankings filtered by player category
 * @access Private
 */
router.get(
  '/category/:category',
  authenticate,
  diMiddleware,
  rankingController.getCategoryBasedRanking
);

/**
 * @swagger
 * /api/rankings/match/{matchId}/update:
 *   post:
 *     summary: Update rankings after match
 *     description: Update player rankings after a match has been completed (admin only)
 *     tags: [Rankings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: matchId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Rankings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     player1Ranking:
 *                       type: object
 *                     player2Ranking:
 *                       type: object
 *       400:
 *         description: Invalid match ID format or match is not completed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Match not found
 *       409:
 *         description: Rankings already updated for this match
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
 * @swagger
 * /api/rankings/calculate:
 *   post:
 *     summary: Calculate player rankings
 *     description: Calculate or recalculate rankings for all players or a specific player (admin only)
 *     tags: [Rankings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               playerId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional player ID to calculate rankings for a specific player
 *     responses:
 *       200:
 *         description: Rankings calculated successfully
 *       400:
 *         description: Invalid player ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Player not found
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

/**
 * @swagger
 * /api/rankings/{categoryId}:
 *   get:
 *     summary: Get rankings by category (legacy)
 *     description: Retrieve player rankings for a specific category/level (backward compatibility)
 *     tags: [Rankings]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED, PROFESSIONAL]
 *         required: true
 *         description: Player category/level
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of category-specific player rankings
 *       400:
 *         description: Invalid category ID
 *     deprecated: true
 */
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

/**
 * @route GET /api/rankings
 * @desc Get all rankings (legacy endpoint)
 * @access Private
 */
router.get(
  '/',
  authenticate,
  diMiddleware,
  rankingController.getRankings
);

export default router;
