import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../../core/domain/user/user.entity';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  userIdParamSchema,
  playerIdParamSchema,
  createPerformanceSchema,
  recordPerformanceSchema,
  updatePerformanceSchema,
  getPerformanceQuerySchema,
  playerPerformanceQuerySchema,
  performanceTrendsQuerySchema,
  playerPerformanceTrendsQuerySchema,
} from '../validations/performance.validation';
import { diMiddleware } from '../middlewares/di.middleware';

const router = Router();
const performanceController = new PerformanceController();

// Apply DI middleware to all routes
router.use(diMiddleware);

/**
 * @route GET /api/performance
 * @desc Get all performance records
 * @access Public
 */
router.get(
  '/',
  validateQuery(getPerformanceQuerySchema),
  performanceController.getPerformanceHistory,
);

/**
 * @route GET /api/performance/summary
 * @desc Get performance summary
 * @access Public
 */
router.get(
  '/summary',
  validateQuery(getPerformanceQuerySchema),
  performanceController.getPerformanceSummary,
);

/**
 * @route GET /api/performance/trends
 * @desc Track performance trends
 * @access Public
 */
router.get(
  '/trends',
  validateQuery(performanceTrendsQuerySchema),
  performanceController.trackPerformanceTrends,
);

/**
 * @route GET /api/performance/player/:playerId/history
 * @desc Get performance history for a specific player
 * @access Public
 */
router.get(
  '/player/:playerId/history',
  validateParams(playerIdParamSchema),
  validateQuery(playerPerformanceQuerySchema),
  performanceController.getPlayerPerformanceHistory,
);

/**
 * @route GET /api/performance/player/:playerId/summary
 * @desc Get performance summary for a specific player
 * @access Public
 */
router.get(
  '/player/:playerId/summary',
  validateParams(playerIdParamSchema),
  validateQuery(playerPerformanceQuerySchema),
  performanceController.getPlayerPerformanceSummary,
);

/**
 * @route GET /api/performance/player/:playerId/trends
 * @desc Get performance trends for a specific player
 * @access Public
 */
router.get(
  '/player/:playerId/trends',
  validateParams(playerIdParamSchema),
  validateQuery(playerPerformanceTrendsQuerySchema),
  performanceController.getPlayerPerformanceTrends,
);

/**
 * @route POST /api/performance/player/:playerId/record
 * @desc Record performance for a specific player
 * @access Private - Admin
 */
router.post(
  '/player/:playerId/record',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(playerIdParamSchema),
  validateBody(recordPerformanceSchema),
  performanceController.recordPlayerPerformance,
);

/**
 * @route GET /api/performance/user/:userId
 * @desc Get performance records for specific user
 * @access Public
 */
router.get(
  '/user/:userId',
  validateParams(userIdParamSchema),
  validateQuery(getPerformanceQuerySchema),
  performanceController.getUserPerformance,
);

/**
 * @route GET /api/performance/:id
 * @desc Get performance record by ID
 * @access Public
 */
router.get('/:id', validateParams(idParamSchema), performanceController.getPerformanceById);

/**
 * @route POST /api/performance
 * @desc Create performance record
 * @access Private - Admin
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateBody(createPerformanceSchema),
  performanceController.createPerformance,
);

/**
 * @route PUT /api/performance/:id
 * @desc Update performance record
 * @access Private - Admin
 */
router.put(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  validateBody(updatePerformanceSchema),
  performanceController.updatePerformance,
);

/**
 * @route DELETE /api/performance/:id
 * @desc Delete performance record
 * @access Private - Admin
 */
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  performanceController.deletePerformance,
);

export default router;
