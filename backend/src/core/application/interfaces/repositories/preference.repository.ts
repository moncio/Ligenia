import { UserPreference } from '@prisma/client';

/**
 * Interface for the preference repository
 */
export interface IPreferenceRepository {
  /**
   * Get user preferences
   * @param userId The ID of the user
   * @returns User preferences or null if not found
   */
  getUserPreferences(userId: string): Promise<UserPreference | null>;

  /**
   * Update user preferences
   * @param userId The ID of the user
   * @param data The preference data to update
   * @returns Updated preferences
   */
  updateUserPreferences(userId: string, data: Partial<UserPreference>): Promise<UserPreference>;

  /**
   * Reset user preferences to default values
   * @param userId The ID of the user
   * @returns Reset preferences
   */
  resetUserPreferences(userId: string): Promise<UserPreference>;
} 