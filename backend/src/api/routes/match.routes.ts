import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { authenticate, authorize, withAuthContainer } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  createMatchSchema,
  updateMatchSchema,
  updateScoreSchema,
  getMatchesQuerySchema,
} from '../validations/match.validation';
import { diMiddleware } from '../middlewares/di.middleware';

const router = Router();
const matchController = new MatchController();

/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match management endpoints
 */

/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches
 *     description: Retrieve a list of all matches with pagination and filters
 *     tags: [Matches]
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
 *         name: tournamentId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by tournament ID
 *       - in: query
 *         name: playerId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by player ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by match status
 *     responses:
 *       200:
 *         description: A list of matches
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
 */
router.get(
  '/', 
  diMiddleware,
  authenticate,
  validateQuery(getMatchesQuerySchema), 
  withAuthContainer(matchController.getMatches)
);

/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get match by ID
 *     description: Retrieve detailed information about a match by its ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match details
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
 *                     match:
 *                       type: object
 *       400:
 *         description: Invalid match ID format
 *       404:
 *         description: Match not found
 */
router.get(
  '/:id', 
  authenticate,
  diMiddleware,
  validateParams(idParamSchema),
  withAuthContainer(matchController.getMatchById)
);

/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create new match
 *     description: Create a new match (admin only)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournamentId
 *               - player1Id
 *               - player2Id
 *               - round
 *               - scheduledTime
 *             properties:
 *               tournamentId:
 *                 type: string
 *                 format: uuid
 *               player1Id:
 *                 type: string
 *                 format: uuid
 *               player2Id:
 *                 type: string
 *                 format: uuid
 *               round:
 *                 type: integer
 *                 minimum: 1
 *               matchNumber:
 *                 type: integer
 *                 minimum: 1
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *                 default: SCHEDULED
 *               score1:
 *                 type: integer
 *                 minimum: 0
 *               score2:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Match created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       409:
 *         description: Match with the same players in the same round already exists
 */
router.post(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateBody(createMatchSchema),
  withAuthContainer(matchController.createMatch),
);

/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Update match
 *     description: Update match details (admin only)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player1Id:
 *                 type: string
 *                 format: uuid
 *               player2Id:
 *                 type: string
 *                 format: uuid
 *               round:
 *                 type: integer
 *                 minimum: 1
 *               matchNumber:
 *                 type: integer
 *                 minimum: 1
 *               scheduledTime:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Match updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Match not found
 */
router.put(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateMatchSchema),
  withAuthContainer(matchController.updateMatch),
);

/**
 * @swagger
 * /api/matches/{id}/score:
 *   patch:
 *     summary: Update match score
 *     description: Update the score of a match (admin only)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score1
 *               - score2
 *               - status
 *             properties:
 *               score1:
 *                 type: integer
 *                 minimum: 0
 *               score2:
 *                 type: integer
 *                 minimum: 0
 *               status:
 *                 type: string
 *                 enum: [IN_PROGRESS, COMPLETED]
 *     responses:
 *       200:
 *         description: Match score updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Match not found
 *       409:
 *         description: Cannot update score for a cancelled match
 */
router.patch(
  '/:id/score',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateScoreSchema),
  withAuthContainer(matchController.updateScore),
);

/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Delete match
 *     description: Delete a match (admin only)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match deleted successfully
 *       400:
 *         description: Invalid match ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Match not found
 */
router.delete(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  withAuthContainer(matchController.deleteMatch),
);

export default router;
