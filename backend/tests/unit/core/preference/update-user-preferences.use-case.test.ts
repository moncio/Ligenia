import { UserPreference } from '@prisma/client';
import { IPreferenceRepository } from '../../../../src/core/application/interfaces/repositories/preference.repository';
import {
  UpdateUserPreferencesUseCase,
  UpdateUserPreferencesInput,
} from '../../../../src/core/application/use-cases/preference/update-user-preferences.use-case';

// Mock repository implementation
class MockPreferenceRepository implements IPreferenceRepository {
  private mockData: Record<string, UserPreference> = {};

  constructor() {
    // Initialize with some test data
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    this.mockData[userId] = {
      id: 'pref1',
      userId,
      theme: 'light',
      fontSize: 16,
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
    if (userId === 'error-user-id') {
      throw new Error('Database connection error');
    }

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

describe('UpdateUserPreferencesUseCase', () => {
  let useCase: UpdateUserPreferencesUseCase;
  let repository: MockPreferenceRepository;

  beforeEach(() => {
    repository = new MockPreferenceRepository();
    useCase = new UpdateUserPreferencesUseCase(repository);
  });

  // Helper function to create a valid input
  const createValidInput = (): UpdateUserPreferencesInput => ({
    userId: '123e4567-e89b-12d3-a456-426614174000',
    theme: 'dark',
    fontSize: 18,
  });

  describe('Update user preferences', () => {
    test('should update existing user preferences', async () => {
      // Arrange
      const input = createValidInput();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const preferences = result.getValue();
      expect(preferences.userId).toBe(input.userId);
      expect(preferences.theme).toBe('dark');
      expect(preferences.fontSize).toBe(18);
    });

    test("should create new preferences if they don't exist", async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174999', // Non-existing user
        theme: 'dark' as 'light' | 'dark' | 'system',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const preferences = result.getValue();
      expect(preferences.userId).toBe(input.userId);
      expect(preferences.theme).toBe('dark');
      expect(preferences.fontSize).toBe(16); // Default value
    });

    test('should update fontSize when provided as string', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        fontSize: '20',
      };

      // Act
      const result = await useCase.execute(input as any);

      // Assert
      expect(result.isSuccess).toBe(true);
      const preferences = result.getValue();
      expect(preferences.fontSize).toBe(20); // Converted to number
    });
  });

  describe('Validation', () => {
    test('should fail with invalid user ID', async () => {
      // Arrange
      const input = {
        userId: 'invalid-user-id',
        theme: 'dark',
      };

      // Act
      const result = await useCase.execute(input as any);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Invalid user ID format');
    });

    test('should fail with invalid theme', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        theme: 'invalid-theme',
      };

      // Act
      const result = await useCase.execute(input as any);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Theme must be one of');
    });

    test('should fail with fontSize out of range', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        fontSize: 50, // Too large
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Number must be less than or equal to 24');
    });

    test('should fail when no preferences provided', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        // No other fields
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('No preferences provided for update');
    });
  });

  describe('Error handling', () => {
    test('should handle repository errors', async () => {
      // Arrange
      const input = {
        userId: 'error-user-id',
        theme: 'dark' as 'light' | 'dark' | 'system',
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database connection error');
    });
  });
});
