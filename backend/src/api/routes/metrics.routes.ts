import { Router } from 'express';
import { MetricsController } from '../controllers/metrics.controller';
import { protectMetricsEndpoint } from '../middlewares/metrics.middleware';
import { catchAsync } from '../middlewares/error.middleware';

const router = Router();
const metricsController = new MetricsController();

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: System metrics and monitoring endpoints
 */

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get system metrics
 *     description: Retrieve detailed system metrics including memory usage, CPU, database connections, and more. 
 *                  Only available in development or for authenticated admins in production.
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System metrics fetched successfully
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
 *                     timestamp:
 *                       type: number
 *                     environment:
 *                       type: string
 *                     memory:
 *                       type: object
 *                     cpu:
 *                       type: object
 *                     uptime:
 *                       type: object
 *                     database:
 *                       type: object
 *                     process:
 *                       type: object
 *       401:
 *         description: Unauthorized - authentication required in production environment
 *       403:
 *         description: Forbidden - admin access required in production environment
 */
router.get('/', protectMetricsEndpoint, catchAsync(metricsController.getSystemMetrics));

export default router; 