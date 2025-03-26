import { UserPreference } from '@prisma/client';
import { IPreferenceRepository } from '../../../../src/core/application/interfaces/repositories/preference.repository';
import {
  UpdateUserPreferencesUseCase,
  UpdateUserPreferencesInput,
} from '../../../../src/core/application/use-cases/preference/update-user-preferences.use-case';
import { Result } from '../../../../src/shared/result';
import { UserPreference as UserPreferenceEntity } from '../../../../src/core/domain/preference/user-preference.entity';
import { Theme } from '../../../../src/core/domain/preference/theme.enum';

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
        enableNotifications: true,
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
    throw new Error('Method not implemented.');
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
    theme: Theme.DARK,
    fontSize: 16,
  });

  describe('Update user preferences', () => {
    it('should update existing preferences successfully', async () => {
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        theme: Theme.DARK,
        fontSize: 16
      };

      const result = await useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const updatedPreferences = result.getValue();
      expect(updatedPreferences).toBeDefined();
      expect(updatedPreferences.userId).toBe(input.userId);
      expect(updatedPreferences.theme).toBe(input.theme);
      expect(updatedPreferences.fontSize).toBe(input.fontSize);
    });

    it('should create new preferences for non-existing user', async () => {
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174001',
        theme: Theme.LIGHT,
        fontSize: 14
      };

      const result = await useCase.execute(input);

      expect(result.isSuccess()).toBe(true);
      const newPreferences = result.getValue();
      expect(newPreferences).toBeDefined();
      expect(newPreferences.userId).toBe(input.userId);
      expect(newPreferences.theme).toBe(input.theme);
      expect(newPreferences.fontSize).toBe(input.fontSize);
    });
  });

  describe('Validation', () => {
    it('should fail with invalid user ID format', async () => {
      const input = {
        userId: 'invalid-id',
        theme: Theme.DARK,
        fontSize: 16
      };

      const result = await useCase.execute(input);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Invalid user ID format');
    });

    it('should fail with invalid theme', async () => {
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        theme: 'invalid-theme' as Theme,
        fontSize: 16
      };

      const result = await useCase.execute(input);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Theme must be one of: light, dark, system');
    });

    it('should fail with font size out of range', async () => {
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        theme: Theme.DARK,
        fontSize: 25
      };

      const result = await useCase.execute(input);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Number must be less than or equal to 24');
    });
  });

  describe('Error handling', () => {
    it('should handle repository errors', async () => {
      const input = {
        userId: 'error-user-id',
        theme: Theme.DARK,
        fontSize: 16
      };

      const result = await useCase.execute(input);

      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Database connection error');
    });
  });
});
