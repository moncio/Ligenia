import { PrismaClient } from '@prisma/client';
import { PreferenceRepository } from '../../../src/infrastructure/database/prisma/repositories/preference.repository';
import { v4 as uuidv4 } from 'uuid';
import { testData, cleanupData } from '../../utils/test-utils';

describe('PreferenceRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PreferenceRepository;
  let testUserIds: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PreferenceRepository(prisma);
  });

  beforeEach(async () => {
    // Clean up any existing test data
    await cleanupData.cleanupAll(prisma);
    
    // Create test users
    const users = await Promise.all([
      testData.createUser(prisma, { email: 'preference-test-1@example.com' }),
      testData.createUser(prisma, { email: 'preference-test-2@example.com' }),
      testData.createUser(prisma, { email: 'preference-test-3@example.com' }),
    ]);
    
    testUserIds = users.map(user => user.id);
    
    // Create a preference for the first user
    await testData.createPreference(prisma, testUserIds[0], {
      theme: 'dark',
      fontSize: 18
    });
    
    // Second user will have no preferences (for testing creation)
    // Third user will be used for reset tests
  });

  afterAll(async () => {
    await cleanupData.cleanupAll(prisma);
    await prisma.$disconnect();
  });

  describe('getUserPreferences', () => {
    it('should return user preferences when they exist', async () => {
      // Act
      const preferences = await repository.getUserPreferences(testUserIds[0]);

      // Assert
      expect(preferences).not.toBeNull();
      expect(preferences?.userId).toBe(testUserIds[0]);
      expect(preferences?.theme).toBe('dark');
      expect(preferences?.fontSize).toBe(18);
    });

    it('should return null when user preferences do not exist', async () => {
      // Act
      const preferences = await repository.getUserPreferences(testUserIds[1]);

      // Assert
      expect(preferences).toBeNull();
    });

    it('should return null for a non-existent user ID', async () => {
      // Act
      const preferences = await repository.getUserPreferences('non-existent-user-id');

      // Assert
      expect(preferences).toBeNull();
    });
  });

  describe('updateUserPreferences', () => {
    it('should update existing user preferences', async () => {
      // Arrange
      const userId = testUserIds[0];
      const updateData = { theme: 'light', fontSize: 16 };
      
      // Act
      const updated = await repository.updateUserPreferences(userId, updateData);
      
      // Assert
      expect(updated).not.toBeNull();
      expect(updated.userId).toBe(userId);
      expect(updated.theme).toBe('light');
      expect(updated.fontSize).toBe(16);
      
      // Verify the update was actually persisted
      const preferences = await repository.getUserPreferences(userId);
      expect(preferences?.theme).toBe('light');
      expect(preferences?.fontSize).toBe(16);
    });

    it('should create new preferences if they do not exist', async () => {
      // Arrange
      const userId = testUserIds[1]; // User without preferences
      const updateData = { theme: 'system', fontSize: 14 };
      
      // Act
      const created = await repository.updateUserPreferences(userId, updateData);
      
      // Assert
      expect(created).not.toBeNull();
      expect(created.userId).toBe(userId);
      expect(created.theme).toBe('system');
      expect(created.fontSize).toBe(14);
      
      // Verify it was persisted
      const preferences = await repository.getUserPreferences(userId);
      expect(preferences?.theme).toBe('system');
      expect(preferences?.fontSize).toBe(14);
    });

    it('should use default values for fields not provided in update data', async () => {
      // Arrange
      const userId = testUserIds[2]; // User without preferences
      const updateData = { theme: 'dark' }; // Only providing theme
      
      // Act
      const created = await repository.updateUserPreferences(userId, updateData);
      
      // Assert
      expect(created).not.toBeNull();
      expect(created.userId).toBe(userId);
      expect(created.theme).toBe('dark'); // From update data
      expect(created.fontSize).toBe(16); // Default value
      
      // Verify it was persisted
      const preferences = await repository.getUserPreferences(userId);
      expect(preferences?.theme).toBe('dark');
      expect(preferences?.fontSize).toBe(16);
    });
  });

  describe('resetUserPreferences', () => {
    it('should reset existing preferences to default values', async () => {
      // Arrange - User 0 already has preferences
      const userId = testUserIds[0];
      
      // Act
      const reset = await repository.resetUserPreferences(userId);
      
      // Assert
      expect(reset).not.toBeNull();
      expect(reset.userId).toBe(userId);
      expect(reset.theme).toBe('light'); // Default value
      expect(reset.fontSize).toBe(16); // Default value
      
      // Verify it was persisted
      const preferences = await repository.getUserPreferences(userId);
      expect(preferences?.theme).toBe('light');
      expect(preferences?.fontSize).toBe(16);
    });

    it('should create default preferences for user without existing preferences', async () => {
      // Arrange
      const userId = testUserIds[1]; // User without preferences
      
      // Act
      const created = await repository.resetUserPreferences(userId);
      
      // Assert
      expect(created).not.toBeNull();
      expect(created.userId).toBe(userId);
      expect(created.theme).toBe('light');
      expect(created.fontSize).toBe(16);
      
      // Verify it was persisted
      const preferences = await repository.getUserPreferences(userId);
      expect(preferences?.theme).toBe('light');
      expect(preferences?.fontSize).toBe(16);
    });
  });
}); 