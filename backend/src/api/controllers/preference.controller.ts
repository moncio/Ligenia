import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { ContainerRequest } from '../middlewares/di.middleware';
import { GetUserPreferencesUseCase } from '../../core/application/use-cases/preference/get-user-preferences.use-case';
import { UpdateUserPreferencesUseCase } from '../../core/application/use-cases/preference/update-user-preferences.use-case';
import { ResetPreferencesUseCase } from '../../core/application/use-cases/preference/reset-preferences.use-case';

export class PreferenceController {
  /**
   * Get user preferences
   * @route GET /api/preferences
   */
  public getPreferences = async (req: AuthRequest & ContainerRequest, res: Response) => {
    try {
      // Verify user is authenticated
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'You must be logged in to access preferences',
        });
      }

      const getUserPreferencesUseCase = req.container?.get(
        'getUserPreferencesUseCase'
      ) as GetUserPreferencesUseCase;

      if (!getUserPreferencesUseCase) {
        console.error('Error getting user preferences: Use case not found in container');
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }

      const result = await getUserPreferencesUseCase.execute({
        userId: req.user.id
      });

      if (result.isFailure()) {
        console.error('Error getting user preferences:', result.getError());
        return res.status(400).json({
          status: 'error',
          message: result.getError().message || 'Failed to get user preferences'
        });
      }

      // Return preferences (can be null for new users)
      const preferences = result.getValue();
      
      return res.status(200).json({
        status: 'success',
        data: {
          preferences: preferences || {
            userId: req.user.id,
            theme: 'system', // Default theme
            fontSize: 16,    // Default font size
          }
        },
      });
    } catch (error) {
      console.error('Error getting preferences:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Get preference by ID
   * @route GET /api/preferences/:id
   */
  public getPreferenceById = async (req: AuthRequest, res: Response) => {
    try {
      // El parámetro id ya ha sido validado por el middleware
      const { id } = req.params;

      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'You must be logged in to access preferences',
        });
      }

      // TODO: Implementar la lógica para obtener preferencia por ID desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      // Simular que la preferencia pertenece al usuario actual
      const preference = {
        id,
        userId: req.user.id,
        theme: 'light',
        fontSize: 'medium',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-10T00:00:00Z',
      };

      // Si la preferencia no pertenece al usuario actual, denegar acceso
      if (preference.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You do not have permission to access this preference',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          preference,
        },
      });
    } catch (error) {
      console.error('Error getting preference by ID:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Create preference
   * @route POST /api/preferences
   */
  public createPreference = async (req: AuthRequest, res: Response) => {
    try {
      // Los datos ya han sido validados por el middleware
      const preferenceData = req.body;

      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'You must be logged in to create preferences',
        });
      }

      // Asegurarse de que la preferencia se crea para el usuario actual
      if (preferenceData.userId && preferenceData.userId !== req.user.id) {
        return res.status(403).json({
          status: 'error',
          message: 'You can only create preferences for your own account',
        });
      }

      // TODO: Implementar la lógica para crear una preferencia desde el caso de uso correspondiente
      // En este punto solo implementamos una respuesta simulada

      const preference = {
        id: 'generated-uuid',
        userId: req.user.id,
        ...preferenceData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return res.status(201).json({
        status: 'success',
        data: {
          preference,
        },
      });
    } catch (error) {
      console.error('Error creating preference:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Update preference
   * @route PUT /api/preferences
   */
  public updatePreference = async (req: AuthRequest & ContainerRequest, res: Response) => {
    try {
      // Preference data validated by middleware
      const preferenceData = req.body;

      // Verify user is authenticated
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'You must be logged in to update preferences',
        });
      }

      const updateUserPreferencesUseCase = req.container?.get(
        'updateUserPreferencesUseCase'
      ) as UpdateUserPreferencesUseCase;

      if (!updateUserPreferencesUseCase) {
        console.error('Error updating user preferences: Use case not found in container');
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }

      const result = await updateUserPreferencesUseCase.execute({
        userId: req.user.id,
        ...preferenceData
      });

      if (result.isFailure()) {
        console.error('Error updating user preferences:', result.getError());
        return res.status(400).json({
          status: 'error',
          message: result.getError().message || 'Failed to update user preferences'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          preference: result.getValue(),
        },
      });
    } catch (error) {
      console.error('Error updating preference:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };

  /**
   * Reset preferences
   * @route DELETE /api/preferences/reset
   */
  public resetPreferences = async (req: AuthRequest & ContainerRequest, res: Response) => {
    try {
      // Verify user is authenticated
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'You must be logged in to reset preferences',
        });
      }

      const resetPreferencesUseCase = req.container?.get(
        'ResetPreferencesUseCase'
      ) as ResetPreferencesUseCase;

      if (!resetPreferencesUseCase) {
        console.error('Error resetting user preferences: Use case not found in container');
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
      }

      const result = await resetPreferencesUseCase.execute({
        userId: req.user.id
      });

      if (result.isFailure()) {
        console.error('Error resetting user preferences:', result.getError());
        return res.status(400).json({
          status: 'error',
          message: result.getError().message || 'Failed to reset user preferences'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          preference: result.getValue(),
          message: 'Preferences reset successfully',
        },
      });
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
}
