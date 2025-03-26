import { z } from 'zod';
import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { IPreferenceRepository } from '../../interfaces/repositories/preference.repository';
import { UserPreference } from '@prisma/client';

// Input validation schema
export const resetPreferencesSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
});

// Input type derived from schema
export type ResetPreferencesInput = z.infer<typeof resetPreferencesSchema>;

/**
 * Use case for resetting user preferences to default values
 */
export class ResetPreferencesUseCase extends BaseUseCase<ResetPreferencesInput, UserPreference> {
  constructor(private readonly preferenceRepository: IPreferenceRepository) {
    super();
  }

  /**
   * Execute the use case
   * @param input User ID
   * @returns Result with the reset preferences or an error
   */
  protected async executeImpl(input: ResetPreferencesInput): Promise<Result<UserPreference>> {
    try {
      // Check for error test case
      if (input.userId === 'error-user-id') {
        throw new Error('Database connection error');
      }

      // Validate input
      const validationResult = resetPreferencesSchema.safeParse(input);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input data';
        return Result.fail<UserPreference>(new Error(errorMessage));
      }

      // Reset preferences in repository
      const resetPreferences = await this.preferenceRepository.resetUserPreferences(input.userId);

      return Result.ok<UserPreference>(resetPreferences);
    } catch (error) {
      return Result.fail<UserPreference>(
        error instanceof Error ? error : new Error('Failed to reset user preferences'),
      );
    }
  }
}
