import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  createPlayerSchema,
  updatePlayerSchema,
  getPlayersQuerySchema
} from '../validations/player.validation';

const router = Router();
const playerController = new PlayerController();

/**
 * @route GET /api/players
 * @desc Get all players (admin only)
 * @access Private - Admin
 */
router.get(
  '/',
  validateQuery(getPlayersQuerySchema),
  playerController.getPlayers
);

/**
 * @route GET /api/players/:id
 * @desc Get player by ID
 * @access Private - Any authenticated user
 */
router.get(
  '/:id',
  validateParams(idParamSchema),
  playerController.getPlayerById
);

/**
 * @route POST /api/players
 * @desc Create player profile
 * @access Private - Any authenticated user
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateBody(createPlayerSchema),
  playerController.createPlayer
);

/**
 * @route PUT /api/players/:id
 * @desc Update player profile
 * @access Private - Self or Admin
 */
router.put(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  validateBody(updatePlayerSchema),
  playerController.updatePlayer
);

/**
 * @route DELETE /api/players/:id
 * @desc Delete player profile
 * @access Private - Admin only
 */
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  playerController.deletePlayer
);

/**
 * @route GET /api/players/:id/statistics
 * @desc Get player statistics
 * @access Private - Any authenticated user
 */
router.get(
  '/:id/statistics',
  validateParams(idParamSchema),
  playerController.getPlayerStatistics
);

/**
 * @route GET /api/players/:id/matches
 * @desc Get player matches
 * @access Private - Any authenticated user
 */
router.get(
  '/:id/matches',
  validateParams(idParamSchema),
  playerController.getPlayerMatches
);

/**
 * @route GET /api/players/:id/tournaments
 * @desc Get player tournaments
 * @access Private - Any authenticated user
 */
router.get(
  '/:id/tournaments',
  validateParams(idParamSchema),
  playerController.getPlayerTournaments
);

export default router; 