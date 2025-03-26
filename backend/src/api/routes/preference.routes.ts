import { Router } from 'express';
import { PreferenceController } from '../controllers/preference.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { updatePreferenceSchema, resetPreferenceSchema } from '../validations/preference.validation';
import { diMiddleware } from '../middlewares/di.middleware';

const router = Router();
const preferenceController = new PreferenceController();

// Apply DI middleware to all routes
router.use(diMiddleware);

/**
 * @swagger
 * tags:
 *   name: Preferences
 *   description: User preferences endpoints
 */

/**
 * @swagger
 * /api/preferences:
 *   get:
 *     summary: Get user preferences
 *     description: Retrieve current user preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences
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
 *                     preferences:
 *                       type: object
 *                       properties:
 *                         theme:
 *                           type: string
 *                           enum: [light, dark, system]
 *                         language:
 *                           type: string
 *                         notifications:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: boolean
 *                             push:
 *                               type: boolean
 *                         displaySettings:
 *                           type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, preferenceController.getPreferences);

/**
 * @swagger
 * /api/preferences:
 *   put:
 *     summary: Update user preferences
 *     description: Update current user preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [light, dark, system]
 *               language:
 *                 type: string
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *               displaySettings:
 *                 type: object
 *                 properties:
 *                   showRankings:
 *                     type: boolean
 *                   matchesPerPage:
 *                     type: integer
 *                     minimum: 5
 *                     maximum: 50
 *     responses:
 *       200:
 *         description: Preferences updated successfully
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
 *                     preferences:
 *                       type: object
 *       400:
 *         description: Invalid preference data
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/',
  authenticate,
  validateBody(updatePreferenceSchema),
  preferenceController.updatePreference,
);

/**
 * @swagger
 * /api/preferences/reset:
 *   delete:
 *     summary: Reset user preferences
 *     description: Reset user preferences to default values
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Preferences reset successfully
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
 *                     preferences:
 *                       type: object
 *       401:
 *         description: Unauthorized
 */
router.delete('/reset', authenticate, preferenceController.resetPreferences);

export default router;
