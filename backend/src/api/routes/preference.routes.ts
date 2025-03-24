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
 * @route GET /api/preferences
 * @desc Get current user preferences
 * @access Private
 */
router.get('/', authenticate, preferenceController.getPreferences);

/**
 * @route PUT /api/preferences
 * @desc Update current user preferences
 * @access Private
 */
router.put(
  '/',
  authenticate,
  validateBody(updatePreferenceSchema),
  preferenceController.updatePreference,
);

/**
 * @route DELETE /api/preferences/reset
 * @desc Reset user preferences to defaults
 * @access Private
 */
router.delete('/reset', authenticate, preferenceController.resetPreferences);

export default router;
