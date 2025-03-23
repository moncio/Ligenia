import { Router } from 'express';
import { PerformanceController } from '../controllers/performance.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { UserRole } from '@prisma/client';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware';
import {
  idParamSchema,
  userIdParamSchema,
  createPerformanceSchema,
  updatePerformanceSchema,
  getPerformanceQuerySchema,
  performanceTrendsQuerySchema,
} from '../validations/performance.validation';

const router = Router();
const performanceController = new PerformanceController();

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
 * @route GET /api/performance/:id
 * @desc Get performance record by ID
 * @access Public
 */
router.get('/:id', validateParams(idParamSchema), performanceController.getPerformanceById);

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

export default router;
