import { Router } from 'express';
import { MatchController } from '../controllers/match.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
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
 * @route GET /api/matches
 * @desc Get all matches
 * @access Public
 */
router.get(
  '/', 
  diMiddleware,
  validateQuery(getMatchesQuerySchema), 
  matchController.getMatches
);

/**
 * @route GET /api/matches/:id
 * @desc Get match by ID
 * @access Public
 */
router.get(
  '/:id', 
  diMiddleware,
  validateParams(idParamSchema), 
  matchController.getMatchById
);

/**
 * @route POST /api/matches
 * @desc Create match
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateBody(createMatchSchema),
  matchController.createMatch,
);

/**
 * @route PUT /api/matches/:id
 * @desc Update match
 * @access Private - Admin
 */
router.put(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateMatchSchema),
  matchController.updateMatch,
);

/**
 * @route PATCH /api/matches/:id/score
 * @desc Update match score
 * @access Private - Admin
 */
router.patch(
  '/:id/score',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updateScoreSchema),
  matchController.updateScore,
);

/**
 * @route DELETE /api/matches/:id
 * @desc Delete match
 * @access Private - Admin
 */
router.delete(
  '/:id',
  authenticate,
  diMiddleware,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  matchController.deleteMatch,
);

export default router;
