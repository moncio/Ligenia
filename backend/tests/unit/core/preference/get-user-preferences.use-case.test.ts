import { UserPreference } from '@prisma/client';
import { IPreferenceRepository } from '../../../../src/core/application/interfaces/repositories/preference.repository';
import {
  GetUserPreferencesUseCase,
  GetUserPreferencesInput,
} from '../../../../src/core/application/use-cases/preference/get-user-preferences.use-case';
import { Result } from '../../../../src/shared/result';

// Mock repository implementation
class MockPreferenceRepository implements IPreferenceRepository {
  private mockData: Record<string, UserPreference> = {};

  constructor() {
    // Initialize with some test data
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    this.mockData[userId] = {
      id: 'pref1',
      userId,
      theme: 'dark',
      fontSize: 20,
      enableNotifications: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    if (userId === 'error-user-id') {
      throw new Error('Database connection error');
    }
    return this.mockData[userId] || null;
  }

  async updateUserPreferences(
    userId: string,
    data: Partial<UserPreference>,
  ): Promise<UserPreference> {
    throw new Error('Method not implemented.');
  }

  async resetUserPreferences(userId: string): Promise<UserPreference> {
    throw new Error('Method not implemented.');
  }
}

describe('GetUserPreferencesUseCase', () => {
  let useCase: GetUserPreferencesUseCase;
  let repository: MockPreferenceRepository;

  beforeEach(() => {
    repository = new MockPreferenceRepository();
    useCase = new GetUserPreferencesUseCase(repository);
  });

  // Helper function to create a valid input
  const createValidInput = (): GetUserPreferencesInput => ({
    userId: '123e4567-e89b-12d3-a456-426614174000',
  });

  describe('Get user preferences', () => {
    test('should return existing user preferences', async () => {
      // Arrange
      const input = createValidInput();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const preferences = result.getValue();
      expect(preferences.userId).toBe(input.userId);
      expect(preferences.theme).toBe('dark');
      expect(preferences.fontSize).toBe(20);
    });

    test('should return null for non-existing preferences', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174999', // Non-existing user
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const preferences = result.getValue();
      expect(preferences).toBeNull();
    });
  });

  describe('Validation', () => {
    test('should fail with invalid user ID', async () => {
      // Arrange
      const input = {
        userId: 'invalid-user-id',
      };

      // Act
      const result = await useCase.execute(input as any);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Invalid user ID format');
    });
  });

  describe('Error handling', () => {
    test('should handle repository errors', async () => {
      // Arrange
      const input = {
        userId: 'error-user-id',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Database connection error');
    });
  });
});
