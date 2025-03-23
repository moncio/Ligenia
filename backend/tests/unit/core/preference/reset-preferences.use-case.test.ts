import { UserPreference } from '@prisma/client';
import { IPreferenceRepository } from '../../../../src/core/application/interfaces/repositories/preference.repository';
import {
  ResetPreferencesUseCase,
  ResetPreferencesInput,
} from '../../../../src/core/application/use-cases/preference/reset-preferences.use-case';

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    return this.mockData[userId] || null;
  }

  async updateUserPreferences(
    userId: string,
    data: Partial<UserPreference>,
  ): Promise<UserPreference> {
    if (!this.mockData[userId]) {
      // Create new preferences if they don't exist
      this.mockData[userId] = {
        id: `pref-${Date.now()}`,
        userId,
        theme: 'system',
        fontSize: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
    } else {
      // Update existing preferences
      this.mockData[userId] = {
        ...this.mockData[userId],
        ...data,
        updatedAt: new Date(),
      };
    }

    return this.mockData[userId];
  }

  async resetUserPreferences(userId: string): Promise<UserPreference> {
    if (userId === 'error-user-id') {
      throw new Error('Database connection error');
    }

    // Reset to default values
    if (!this.mockData[userId]) {
      // Create with default values if they don't exist
      this.mockData[userId] = {
        id: `pref-${Date.now()}`,
        userId,
        theme: 'system',
        fontSize: 16,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } else {
      // Reset existing to defaults
      this.mockData[userId] = {
        ...this.mockData[userId],
        theme: 'system',
        fontSize: 16,
        updatedAt: new Date(),
      };
    }

    return this.mockData[userId];
  }
}

describe('ResetPreferencesUseCase', () => {
  let useCase: ResetPreferencesUseCase;
  let repository: MockPreferenceRepository;

  beforeEach(() => {
    repository = new MockPreferenceRepository();
    useCase = new ResetPreferencesUseCase(repository);
  });

  // Helper function to create a valid input
  const createValidInput = (): ResetPreferencesInput => ({
    userId: '123e4567-e89b-12d3-a456-426614174000',
  });

  describe('Reset preferences', () => {
    test('should reset existing user preferences to defaults', async () => {
      // Arrange
      const input = createValidInput();

      // Verify initial values
      const initialPrefs = await repository.getUserPreferences(input.userId);
      expect(initialPrefs?.theme).toBe('dark');
      expect(initialPrefs?.fontSize).toBe(20);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const preferences = result.getValue();
      expect(preferences.userId).toBe(input.userId);
      expect(preferences.theme).toBe('system'); // Reset to default
      expect(preferences.fontSize).toBe(16); // Reset to default
    });

    test('should create defaults for non-existing preferences', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174999', // Non-existing user
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const preferences = result.getValue();
      expect(preferences.userId).toBe(input.userId);
      expect(preferences.theme).toBe('system');
      expect(preferences.fontSize).toBe(16);
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
      expect(result.isFailure).toBe(true);
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
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database connection error');
    });
  });
});
