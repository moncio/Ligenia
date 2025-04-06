import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { authenticate, authorize, withAuthContainer } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  createPlayerSchema,
  updatePlayerSchema,
  getPlayersQuerySchema,
  playerValidationSchema
} from '../validations/player.validation';
import { diMiddleware } from '../middlewares/di.middleware';

const router = Router();
const playerController = new PlayerController();

/**
 * @swagger
 * tags:
 *   name: Players
 *   description: Player management endpoints
 */

/**
 * @swagger
 * /api/players:
 *   get:
 *     summary: Get all players
 *     description: Retrieve a list of all players with pagination and filters (admin only)
 *     tags: [Players]
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
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by player name
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: A list of players
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
 *                     players:
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
  validateQuery(getPlayersQuerySchema),
  authenticate,
  diMiddleware,
  playerController.getPlayers
);

/**
 * @swagger
 * /api/players/{id}:
 *   get:
 *     summary: Get player by ID
 *     description: Retrieve detailed information about a player by their ID
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player details
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
 *                     player:
 *                       type: object
 *       400:
 *         description: Invalid player ID format
 *       404:
 *         description: Player not found
 */
router.get(
  '/:id', 
  diMiddleware,
  validateParams(idParamSchema), 
  playerController.getPlayerById
);

/**
 * @swagger
 * /api/players:
 *   post:
 *     summary: Create new player
 *     description: Create a new player profile (admin only)
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - userId
 *             properties:
 *               name:
 *                 type: string
 *               userId:
 *                 type: string
 *                 format: uuid
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Player created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       409:
 *         description: Player with that user ID already exists
 */
router.post(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateBody(createPlayerSchema),
  withAuthContainer(playerController.createPlayer),
);

/**
 * @swagger
 * /api/players/{id}:
 *   put:
 *     summary: Update player
 *     description: Update a player's profile (admin or self only)
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Player updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Neither admin nor player owner
 *       404:
 *         description: Player not found
 */
router.put(
  '/:id',
  authenticate,
  diMiddleware,
  validateParams(idParamSchema),
  validateBody(updatePlayerSchema),
  withAuthContainer(playerController.updatePlayer),
);

/**
 * @swagger
 * /api/players/{id}:
 *   delete:
 *     summary: Delete player
 *     description: Delete a player profile (admin only)
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
 *     responses:
 *       200:
 *         description: Player deleted successfully
 *       400:
 *         description: Invalid player ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Player not found
 */
router.delete(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  withAuthContainer(playerController.deletePlayer),
);

/**
 * @swagger
 * /api/players/{id}/statistics:
 *   get:
 *     summary: Get player statistics
 *     description: Retrieve comprehensive statistics for a player
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
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
 *       400:
 *         description: Invalid player ID format
 *       404:
 *         description: Player not found
 */
router.get(
  '/:id/statistics', 
  diMiddleware,
  validateParams(idParamSchema), 
  playerController.getPlayerStatistics
);

/**
 * @swagger
 * /api/players/{id}/matches:
 *   get:
 *     summary: Get player matches
 *     description: Retrieve all matches a player has participated in
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
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
 *         description: Player matches
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
 *                     matches:
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
 *       400:
 *         description: Invalid player ID format
 *       404:
 *         description: Player not found
 */
router.get(
  '/:id/matches', 
  diMiddleware,
  validateParams(idParamSchema), 
  playerController.getPlayerMatches
);

/**
 * @swagger
 * /api/players/{id}/tournaments:
 *   get:
 *     summary: Get player tournaments
 *     description: Retrieve all tournaments a player has participated in
 *     tags: [Players]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
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
 *         description: Player tournaments
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
 *                     tournaments:
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
 *       400:
 *         description: Invalid player ID format
 *       404:
 *         description: Player not found
 */
router.get(
  '/:id/tournaments',
  diMiddleware,
  validateParams(idParamSchema),
  playerController.getPlayerTournaments,
);

export default router;
