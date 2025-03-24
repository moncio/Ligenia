import { Router } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  createPlayerSchema,
  updatePlayerSchema,
  getPlayersQuerySchema,
} from '../validations/player.validation';
import { diMiddleware } from '../middlewares/di.middleware';

const router = Router();
const playerController = new PlayerController();

/**
 * @route GET /api/players
 * @desc Get all players (admin only)
 * @access Private - Admin
 */
router.get(
  '/', 
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateQuery(getPlayersQuerySchema), 
  playerController.getPlayers
);

/**
 * @route GET /api/players/:id
 * @desc Get player by ID
 * @access Public
 */
router.get(
  '/:id', 
  diMiddleware,
  validateParams(idParamSchema), 
  playerController.getPlayerById
);

/**
 * @route POST /api/players
 * @desc Create player profile
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateBody(createPlayerSchema),
  playerController.createPlayer,
);

/**
 * @route PUT /api/players/:id
 * @desc Update player profile
 * @access Private - Self or Admin
 */
router.put(
  '/:id',
  authenticate,
  diMiddleware,
  validateParams(idParamSchema),
  validateBody(updatePlayerSchema),
  playerController.updatePlayer,
);

/**
 * @route DELETE /api/players/:id
 * @desc Delete player profile
 * @access Private - Admin only
 */
router.delete(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  playerController.deletePlayer,
);

/**
 * @route GET /api/players/:id/statistics
 * @desc Get player statistics
 * @access Public
 */
router.get(
  '/:id/statistics', 
  diMiddleware,
  validateParams(idParamSchema), 
  playerController.getPlayerStatistics
);

/**
 * @route GET /api/players/:id/matches
 * @desc Get player matches
 * @access Public
 */
router.get(
  '/:id/matches', 
  diMiddleware,
  validateParams(idParamSchema), 
  playerController.getPlayerMatches
);

/**
 * @route GET /api/players/:id/tournaments
 * @desc Get player tournaments
 * @access Public
 */
router.get(
  '/:id/tournaments',
  diMiddleware,
  validateParams(idParamSchema),
  playerController.getPlayerTournaments,
);

export default router;
