import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
} from '../validations/user.validation';
import { updatePreferenceSchema } from '../validations/preference.validation';

const router = Router();
const userController = new UserController();

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private - Admin
 */
router.get('/', authenticate, authorize([UserRole.ADMIN]), userController.getUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private - Self or Admin
 */
router.get('/:id', authenticate, validateParams(idParamSchema), userController.getUserById);

/**
 * @route POST /api/users
 * @desc Create a new user
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateBody(createUserSchema),
  userController.createUser,
);

/**
 * @route PUT /api/users/:id
 * @desc Update user
 * @access Private - Self or Admin
 */
router.put(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  userController.updateUser,
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private - Self or Admin
 */
router.delete('/:id', authenticate, validateParams(idParamSchema), userController.deleteUser);

/**
 * @route GET /api/users/:id/statistics
 * @desc Get user statistics
 * @access Private
 */
router.get(
  '/:id/statistics',
  authenticate,
  validateParams(idParamSchema),
  userController.getUserStatistics,
);

/**
 * @route GET /api/users/:id/preferences
 * @desc Get user preferences
 * @access Private - Self
 */
router.get(
  '/:id/preferences',
  authenticate,
  validateParams(idParamSchema),
  userController.getUserPreferences,
);

/**
 * @route PUT /api/users/:id/preferences
 * @desc Update user preferences
 * @access Private - Self
 */
router.put(
  '/:id/preferences',
  authenticate,
  validateParams(idParamSchema),
  validateBody(updatePreferenceSchema),
  userController.updateUserPreferences,
);

/**
 * @route POST /api/users/:id/change-password
 * @desc Change user password
 * @access Private - Self
 */
router.post(
  '/:id/change-password',
  authenticate,
  validateParams(idParamSchema),
  validateBody(changePasswordSchema),
  userController.changePassword,
);

/**
 * @route GET /api/users/:id/performance/:year
 * @desc Get user performance by year
 * @access Private
 */
router.get('/:id/performance/:year', authenticate, userController.getUserPerformance);

/**
 * @route GET /api/users/:id/match-history
 * @desc Get user match history
 * @access Private
 */
router.get('/:id/match-history', authenticate, userController.getMatchHistory);

export default router;
