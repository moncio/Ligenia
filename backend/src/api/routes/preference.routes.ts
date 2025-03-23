import { Router } from 'express';
import { PreferenceController } from '../controllers/preference.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateParams } from '../middlewares/validate.middleware';
import { idParamSchema } from '../validations/user.validation';
import { updatePreferenceSchema } from '../validations/preference.validation';

const router = Router();
const preferenceController = new PreferenceController();

/**
 * @route GET /api/preferences
 * @desc Get current user preferences
 * @access Private
 */
router.get(
  '/',
  authenticate,
  preferenceController.getPreferences
);

/**
 * @route PUT /api/preferences
 * @desc Update current user preferences
 * @access Private
 */
router.put(
  '/',
  authenticate,
  validateBody(updatePreferenceSchema),
  preferenceController.updatePreference
);

/**
 * @route POST /api/preferences/reset
 * @desc Reset user preferences to defaults
 * @access Private
 */
router.post(
  '/reset',
  authenticate,
  preferenceController.resetPreferences
);

export default router; 