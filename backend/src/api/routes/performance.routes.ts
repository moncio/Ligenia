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
 * @swagger
 * tags:
 *   name: Performance
 *   description: Player performance tracking endpoints
 */

/**
 * @swagger
 * /api/performance:
 *   get:
 *     summary: Get all performance records
 *     description: Retrieve performance records with pagination and filters
 *     tags: [Performance]
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
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (start date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (end date)
 *     responses:
 *       200:
 *         description: List of performance records
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
 *                     performances:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 */
router.get(
  '/',
  validateQuery(getPerformanceQuerySchema),
  performanceController.getPerformanceHistory,
);

/**
 * @swagger
 * /api/performance/summary:
 *   get:
 *     summary: Get performance summary
 *     description: Retrieve aggregated performance summary with metrics
 *     tags: [Performance]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (start date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (end date)
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [accuracy, speed, consistency]
 *         description: Performance metric to summarize
 *     responses:
 *       200:
 *         description: Performance summary metrics
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         averageAccuracy:
 *                           type: number
 *                         averageSpeed:
 *                           type: number
 *                         averageConsistency:
 *                           type: number
 *                         totalRecords:
 *                           type: integer
 */
router.get(
  '/summary',
  validateQuery(getPerformanceQuerySchema),
  performanceController.getPerformanceSummary,
);

/**
 * @swagger
 * /api/performance/trends:
 *   get:
 *     summary: Track performance trends
 *     description: Analyze performance trends over time
 *     tags: [Performance]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for trend analysis
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for trend analysis
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [accuracy, speed, consistency]
 *         description: Performance metric to track
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Time interval for grouping data
 *     responses:
 *       200:
 *         description: Performance trend analysis
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
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           interval:
 *                             type: string
 *                           value:
 *                             type: number
 */
router.get(
  '/trends',
  validateQuery(performanceTrendsQuerySchema),
  performanceController.trackPerformanceTrends,
);

/**
 * @swagger
 * /api/performance/player/{playerId}/history:
 *   get:
 *     summary: Get player performance history
 *     description: Retrieve performance history for a specific player
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: playerId
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
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (start date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (end date)
 *     responses:
 *       200:
 *         description: Player's performance history
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
 *                     performances:
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
  '/player/:playerId/history',
  validateParams(playerIdParamSchema),
  validateQuery(playerPerformanceQuerySchema),
  performanceController.getPlayerPerformanceHistory,
);

/**
 * @swagger
 * /api/performance/player/{playerId}/summary:
 *   get:
 *     summary: Get player performance summary
 *     description: Retrieve aggregated performance summary for a specific player
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (start date)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by performance date (end date)
 *     responses:
 *       200:
 *         description: Player's performance summary
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         averageAccuracy:
 *                           type: number
 *                         averageSpeed:
 *                           type: number
 *                         averageConsistency:
 *                           type: number
 *                         improvement:
 *                           type: number
 *       400:
 *         description: Invalid player ID format
 *       404:
 *         description: Player not found
 */
router.get(
  '/player/:playerId/summary',
  validateParams(playerIdParamSchema),
  validateQuery(playerPerformanceQuerySchema),
  performanceController.getPlayerPerformanceSummary,
);

/**
 * @swagger
 * /api/performance/player/{playerId}/trends:
 *   get:
 *     summary: Get player performance trends
 *     description: Analyze performance trends over time for a specific player
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: playerId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Player ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for trend analysis
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for trend analysis
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [accuracy, speed, consistency]
 *         description: Performance metric to track
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: week
 *         description: Time interval for grouping data
 *     responses:
 *       200:
 *         description: Player's performance trend analysis
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
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           interval:
 *                             type: string
 *                           value:
 *                             type: number
 *       400:
 *         description: Invalid player ID format
 *       404:
 *         description: Player not found
 */
router.get(
  '/player/:playerId/trends',
  validateParams(playerIdParamSchema),
  validateQuery(playerPerformanceTrendsQuerySchema),
  performanceController.getPlayerPerformanceTrends,
);

/**
 * @swagger
 * /api/performance/player/{playerId}/record:
 *   post:
 *     summary: Record player performance
 *     description: Record performance metrics for a specific player (admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playerId
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
 *             required:
 *               - accuracy
 *               - speed
 *               - consistency
 *               - date
 *             properties:
 *               accuracy:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Accuracy score (0-100)
 *               speed:
 *                 type: number
 *                 minimum: 0
 *                 description: Speed measurement
 *               consistency:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Consistency score (0-100)
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of performance
 *     responses:
 *       201:
 *         description: Performance recorded successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Player not found
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
 * @swagger
 * /api/performance/user/{userId}:
 *   get:
 *     summary: Get user performance
 *     description: Retrieve performance records for a specific user
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: User ID
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
 *         description: User's performance records
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
 *                     performances:
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
 *         description: Invalid user ID format
 *       404:
 *         description: User not found
 */
router.get(
  '/user/:userId',
  validateParams(userIdParamSchema),
  validateQuery(getPerformanceQuerySchema),
  performanceController.getUserPerformance,
);

/**
 * @swagger
 * /api/performance/{id}:
 *   get:
 *     summary: Get performance by ID
 *     description: Retrieve a specific performance record by its ID
 *     tags: [Performance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Performance record ID
 *     responses:
 *       200:
 *         description: Performance record details
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
 *                     performance:
 *                       type: object
 *       400:
 *         description: Invalid performance ID format
 *       404:
 *         description: Performance record not found
 */
router.get('/:id', validateParams(idParamSchema), performanceController.getPerformanceById);

/**
 * @swagger
 * /api/performance:
 *   post:
 *     summary: Create performance record
 *     description: Create a new performance record (admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - playerId
 *               - accuracy
 *               - speed
 *               - consistency
 *               - date
 *             properties:
 *               playerId:
 *                 type: string
 *                 format: uuid
 *               accuracy:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               speed:
 *                 type: number
 *                 minimum: 0
 *               consistency:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               notes:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Performance record created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Player not found
 */
router.post(
  '/',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateBody(createPerformanceSchema),
  performanceController.createPerformance,
);

/**
 * @swagger
 * /api/performance/{id}:
 *   put:
 *     summary: Update performance record
 *     description: Update an existing performance record (admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Performance record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accuracy:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               speed:
 *                 type: number
 *                 minimum: 0
 *               consistency:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               notes:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Performance record updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Performance record not found
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
 * @swagger
 * /api/performance/{id}:
 *   delete:
 *     summary: Delete performance record
 *     description: Delete a performance record (admin only)
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: Performance record ID
 *     responses:
 *       200:
 *         description: Performance record deleted successfully
 *       400:
 *         description: Invalid performance ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Performance record not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize([UserRole.ADMIN]),
  validateParams(idParamSchema),
  performanceController.deletePerformance,
);

export default router;
