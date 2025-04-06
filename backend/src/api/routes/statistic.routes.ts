import { Router } from 'express';
import { StatisticController } from '../controllers/statistic.controller';
import { authenticate, authorize, withAuthContainer } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  userIdParamSchema,
  playerIdParamSchema,
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
 * @swagger
 * tags:
 *   name: Statistics
 *   description: Player and tournament statistics endpoints
 */

/**
 * @swagger
 * /api/statistics/player/{playerId}:
 *   get:
 *     summary: Get player statistics
 *     description: Retrieve detailed statistics for a specific player
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player statistics
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
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalMatches:
 *                           type: integer
 *                         wins:
 *                           type: integer
 *                         losses:
 *                           type: integer
 *                         winRate:
 *                           type: number
 *                         totalPoints:
 *                           type: integer
 *                         averagePointsPerMatch:
 *                           type: number
 *       400:
 *         description: Invalid player ID format
 *       404:
 *         description: Player not found
 */
router.get(
  '/player/:playerId',
  diMiddleware,
  validateParams(playerIdParamSchema),
  withAuthContainer(statisticController.getPlayerStatistics)
);

/**
 * @swagger
 * /api/statistics/tournament/{tournamentId}:
 *   get:
 *     summary: Get tournament statistics
 *     description: Retrieve aggregated statistics for a specific tournament
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament statistics
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
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalMatches:
 *                           type: integer
 *                         completedMatches:
 *                           type: integer
 *                         averagePointsPerMatch:
 *                           type: number
 *                         topScorers:
 *                           type: array
 *                           items:
 *                             type: object
 *       400:
 *         description: Invalid tournament ID format
 *       404:
 *         description: Tournament not found
 */
router.get(
  '/tournament/:tournamentId',
  diMiddleware,
  validateParams(tournamentIdParamSchema),
  withAuthContainer(statisticController.getTournamentStatistics)
);

/**
 * @swagger
 * /api/statistics/global:
 *   get:
 *     summary: Get global statistics
 *     description: Retrieve global platform statistics with optional filters (public access)
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [day, week, month, year, all]
 *           default: all
 *         description: Time period for statistics
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [BEGINNER, INTERMEDIATE, ADVANCED, PROFESSIONAL]
 *         description: Filter by player category
 *     responses:
 *       200:
 *         description: Global statistics
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
 *                     totalPlayers:
 *                       type: integer
 *                     totalTournaments:
 *                       type: integer
 *                     totalMatches:
 *                       type: integer
 *                     averageMatchesPerPlayer:
 *                       type: number
 *                     topRankedPlayers:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get(
  '/global',
  diMiddleware,
  validateQuery(getStatisticsQuerySchema),
  withAuthContainer(statisticController.getGlobalStatistics)
);

/**
 * @swagger
 * /api/statistics/update/{matchId}:
 *   post:
 *     summary: Update statistics after match
 *     description: Update player and tournament statistics after a match has been completed (admin only)
 *     tags: [Statistics]
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
 *         description: Statistics updated successfully
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
 *                     player1Statistics:
 *                       type: object
 *                     player2Statistics:
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
 *         description: Statistics already updated for this match
 */
router.post(
  '/update/:matchId',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(matchIdParamSchema),
  withAuthContainer(statisticController.updateStatisticsAfterMatch)
);

// The following routes are for admin functionality

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Get all statistics
 *     description: Retrieve all statistics with pagination and filters (admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
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
 *         name: playerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by player ID
 *       - in: query
 *         name: tournamentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by tournament ID
 *     responses:
 *       200:
 *         description: List of statistics
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
 *                     statistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 */
router.get(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateQuery(getStatisticsQuerySchema),
  withAuthContainer(statisticController.getStatistics)
);

/**
 * @swagger
 * /api/statistics/{id}:
 *   get:
 *     summary: Get statistic by ID
 *     description: Retrieve a specific statistic by its ID (admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Statistic ID
 *     responses:
 *       200:
 *         description: Statistic details
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
 *                     statistic:
 *                       type: object
 *       400:
 *         description: Invalid statistic ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Statistic not found
 */
router.get(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  withAuthContainer(statisticController.getStatisticById)
);

/**
 * @swagger
 * /api/statistics:
 *   post:
 *     summary: Create statistic
 *     description: Create a new statistic record (admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - matchId
 *             properties:
 *               playerId:
 *                 type: string
 *                 format: uuid
 *               matchId:
 *                 type: string
 *                 format: uuid
 *               tournamentId:
 *                 type: string
 *                 format: uuid
 *               points:
 *                 type: integer
 *                 minimum: 0
 *               wins:
 *                 type: integer
 *                 minimum: 0
 *               losses:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Statistic created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       409:
 *         description: Statistic already exists for this player and match
 */
router.post(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateBody(createStatisticSchema),
  withAuthContainer(statisticController.createStatistic)
);

/**
 * @swagger
 * /api/statistics/{id}:
 *   put:
 *     summary: Update statistic
 *     description: Update an existing statistic record (admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Statistic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               points:
 *                 type: integer
 *                 minimum: 0
 *               wins:
 *                 type: integer
 *                 minimum: 0
 *               losses:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Statistic updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Statistic not found
 */
router.put(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateStatisticSchema),
  withAuthContainer(statisticController.updateStatistic)
);

/**
 * @swagger
 * /api/statistics/{id}:
 *   delete:
 *     summary: Delete statistic
 *     description: Delete a statistic record (admin only)
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Statistic ID
 *     responses:
 *       200:
 *         description: Statistic deleted successfully
 *       400:
 *         description: Invalid statistic ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Statistic not found
 */
router.delete(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  withAuthContainer(statisticController.deleteStatistic)
);

/**
 * @swagger
 * /api/statistics/user/{userId}:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve statistics for a specific user (deprecated, use /player/{playerId} instead)
 *     tags: [Statistics]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User statistics
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: User not found
 *     deprecated: true
 */
router.get(
  '/user/:userId',
  diMiddleware,
  validateParams(userIdParamSchema),
  withAuthContainer(statisticController.getUserStatistics)
);

export default router;
