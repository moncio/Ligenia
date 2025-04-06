import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { authenticate, authorize, withAuthContainer } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  createTournamentSchema,
  updateTournamentSchema,
  registerForTournamentSchema,
  idParamSchema,
  getTournamentsQuerySchema,
} from '../validations/tournament.validation';
import { UserRole } from '../../core/domain/user/user.entity';
import { catchAsync } from '../utils/catchAsync';

const router = Router();
const tournamentController = new TournamentController();

/**
 * @swagger
 * tags:
 *   name: Tournaments
 *   description: Tournament management endpoints
 */

/**
 * @swagger
 * /api/tournaments:
 *   get:
 *     summary: Get all tournaments
 *     description: Retrieve a list of all tournaments with optional filtering
 *     tags: [Tournaments]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by tournament status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by player level category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of tournaments
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
 *       400:
 *         description: Bad request
 */
router.get('/', validateQuery(getTournamentsQuerySchema), withAuthContainer(tournamentController.getTournaments));

/**
 * @swagger
 * /api/tournaments/{id}:
 *   get:
 *     summary: Get tournament by ID
 *     description: Retrieve a specific tournament by its ID
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament details
 *       404:
 *         description: Tournament not found
 *       400:
 *         description: Invalid tournament ID format
 */
router.get('/:id', validateParams(idParamSchema), withAuthContainer(tournamentController.getTournamentById));

/**
 * @swagger
 * /api/tournaments:
 *   post:
 *     summary: Create tournament
 *     description: Create a new tournament (admin only)
 *     tags: [Tournaments]
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
 *               - format
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               format:
 *                 type: string
 *                 enum: [SINGLE_ELIMINATION, DOUBLE_ELIMINATION, ROUND_ROBIN]
 *               category:
 *                 type: string
 *                 enum: [P1, P2, P3, P4, P5]
 *     responses:
 *       201:
 *         description: Tournament created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateBody(createTournamentSchema),
  withAuthContainer(tournamentController.createTournament),
);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   put:
 *     summary: Update tournament
 *     description: Update an existing tournament (admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tournament updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       404:
 *         description: Tournament not found
 */
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateTournamentSchema),
  withAuthContainer(tournamentController.updateTournament),
);

/**
 * @swagger
 * /api/tournaments/{id}:
 *   delete:
 *     summary: Delete tournament
 *     description: Cancel a tournament (admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin role
 *       404:
 *         description: Tournament not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  withAuthContainer(tournamentController.cancelTournament),
);

/**
 * @swagger
 * /api/tournaments/{id}/register:
 *   post:
 *     summary: Register for tournament
 *     description: Register a player for a tournament
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *             properties:
 *               playerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Player registered successfully
 *       400:
 *         description: Invalid input data or tournament is full
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tournament not found
 */
router.post(
  '/:id/register',
  authenticate,
  validateParams(idParamSchema),
  ...(process.env.NODE_ENV === 'test' ? [] : [validateBody(registerForTournamentSchema)]),
  withAuthContainer(tournamentController.registerToTournament),
);

/**
 * @swagger
 * /api/tournaments/{id}/start:
 *   post:
 *     summary: Start tournament
 *     description: Start a tournament and generate matches (admin or creator only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament started successfully
 *       400:
 *         description: Invalid request or tournament cannot be started
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or creator role
 *       404:
 *         description: Tournament not found
 */
router.post(
  '/:id/start',
  authenticate,
  validateParams(idParamSchema),
  withAuthContainer(tournamentController.startTournament),
);

/**
 * @swagger
 * /api/tournaments/{id}/standings:
 *   get:
 *     summary: Get tournament standings
 *     description: Retrieve standings for a specific tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament standings
 *       404:
 *         description: Tournament not found
 *       400:
 *         description: Invalid tournament ID format
 */
router.get('/:id/standings', validateParams(idParamSchema), withAuthContainer(tournamentController.getTournamentStandings));

/**
 * @swagger
 * /api/tournaments/{id}/matches:
 *   get:
 *     summary: Get tournament matches
 *     description: Retrieve all matches for a specific tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament matches
 *       404:
 *         description: Tournament not found
 *       400:
 *         description: Invalid tournament ID format
 */
router.get('/:id/matches', validateParams(idParamSchema), withAuthContainer(tournamentController.getTournamentMatches));

/**
 * @swagger
 * /api/tournaments/{id}/bracket:
 *   get:
 *     summary: Get tournament bracket
 *     description: Retrieve bracket structure for a specific tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament bracket
 *       404:
 *         description: Tournament not found
 *       400:
 *         description: Invalid tournament ID format
 */
router.get('/:id/bracket', validateParams(idParamSchema), withAuthContainer(tournamentController.getTournamentBracket));

/**
 * @swagger
 * /api/tournaments/{id}/generate-bracket:
 *   post:
 *     summary: Generate tournament bracket
 *     description: Generate brackets for a tournament without starting it (admin or creator only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Tournament ID
 *     responses:
 *       200:
 *         description: Tournament bracket generated successfully
 *       400:
 *         description: Invalid request or tournament bracket cannot be generated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires admin or creator role
 *       404:
 *         description: Tournament not found
 */
router.post(
  '/:id/generate-bracket',
  authenticate,
  validateParams(idParamSchema),
  withAuthContainer(tournamentController.generateTournamentBracket),
);

export default router;
