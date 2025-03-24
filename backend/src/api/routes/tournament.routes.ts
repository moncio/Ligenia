import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  createTournamentSchema,
  updateTournamentSchema,
  registerForTournamentSchema,
  idParamSchema,
  getTournamentsQuerySchema,
} from '../validations/tournament.validation';
import { UserRole } from '../../core/domain/user/user.entity';

const router = Router();
const tournamentController = new TournamentController();

/**
 * @route GET /api/tournaments
 * @desc Get all tournaments
 * @access Public
 */
router.get('/', validateQuery(getTournamentsQuerySchema), tournamentController.getTournaments);

/**
 * @route GET /api/tournaments/:id
 * @desc Get tournament by ID
 * @access Public
 */
router.get('/:id', validateParams(idParamSchema), tournamentController.getTournamentById);

/**
 * @route POST /api/tournaments
 * @desc Create tournament
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateBody(createTournamentSchema),
  tournamentController.createTournament,
);

/**
 * @route PUT /api/tournaments/:id
 * @desc Update tournament
 * @access Private - Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateTournamentSchema),
  tournamentController.updateTournament,
);

/**
 * @route DELETE /api/tournaments/:id
 * @desc Delete tournament
 * @access Private - Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  tournamentController.deleteTournament,
);

/**
 * @route POST /api/tournaments/:id/register
 * @desc Register for tournament
 * @access Private
 */
router.post(
  '/:id/register',
  authenticate,
  validateParams(idParamSchema),
  validateBody(registerForTournamentSchema),
  tournamentController.registerForTournament,
);

/**
 * @route GET /api/tournaments/:id/standings
 * @desc Get tournament standings
 * @access Public
 */
router.get(
  '/:id/standings',
  validateParams(idParamSchema),
  tournamentController.getTournamentStandings,
);

/**
 * @route GET /api/tournaments/:id/matches
 * @desc Get tournament matches
 * @access Public
 */
router.get(
  '/:id/matches',
  validateParams(idParamSchema),
  tournamentController.getTournamentMatches,
);

/**
 * @route GET /api/tournaments/:id/bracket
 * @desc Get tournament bracket
 * @access Public
 */
router.get(
  '/:id/bracket',
  validateParams(idParamSchema),
  tournamentController.getTournamentBracket,
);

export default router;
