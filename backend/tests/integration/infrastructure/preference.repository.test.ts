import { PrismaClient, UserPreference, User, UserRole } from '@prisma/client';
import { PreferenceRepository } from '../../../src/infrastructure/database/prisma/repositories/preference.repository';
import { v4 as uuidv4 } from 'uuid';

describe('PreferenceRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PreferenceRepository;
  let testUsers: { id: string }[] = [];
  let testPreferences: UserPreference[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PreferenceRepository(prisma);

    // Create test users
    testUsers = await Promise.all(
      Array(3).fill(0).map(async (_, i) => {
        const userId = uuidv4();
        await prisma.user.create({
          data: {
            id: userId,
            email: `preference_test${i}@example.com`,
            password: 'password',
            name: `Preference Test User ${i}`,
            role: UserRole.PLAYER,
          },
        });
        return { id: userId };
      })
    );

    // Create a preference for the first user
    const preference = await prisma.userPreference.create({
      data: {
        id: uuidv4(),
        userId: testUsers[0].id,
        theme: 'dark',
        fontSize: 18
      }
    });
    testPreferences.push(preference);

    // The second user will have default preferences created during tests
    // The third user will have no preferences and will test reset functionality
  });

  afterAll(async () => {
    // Clean up test data
    for (const preference of testPreferences) {
      try {
        await prisma.userPreference.delete({
          where: { id: preference.id }
        });
      } catch (error) {
        // Ignore errors if record doesn't exist
      }
    }

    // Clean up test users
    for (const user of testUsers) {
      try {
        await prisma.user.delete({
          where: { id: user.id }
        });
      } catch (error) {
        // Ignore errors if record doesn't exist
      }
    }

    await prisma.$disconnect();
  });

  describe('getUserPreferences', () => {
    it('should return user preferences when they exist', async () => {
      // Arrange
      const userId = testUsers[0].id;

      // Act
      const preferences = await repository.getUserPreferences(userId);

      // Assert
      expect(preferences).toBeDefined();
      expect(preferences?.userId).toBe(userId);
      expect(preferences?.theme).toBe('dark');
      expect(preferences?.fontSize).toBe(18);
    });

    it('should return null when user preferences do not exist', async () => {
      // Arrange
      const userId = testUsers[1].id;

      // Act
      const preferences = await repository.getUserPreferences(userId);

      // Assert
      expect(preferences).toBeNull();
    });

    it('should return null for a non-existent user ID', async () => {
      // Act
      const preferences = await repository.getUserPreferences('non-existent-user');

      // Assert
      expect(preferences).toBeNull();
    });
  });

  describe('updateUserPreferences', () => {
    it('should update existing user preferences', async () => {
      // Arrange
      const userId = testUsers[0].id;
      const updateData = {
        theme: 'light',
        fontSize: 14
      };

      // Act
      const updatedPreferences = await repository.updateUserPreferences(userId, updateData);
      testPreferences.push(updatedPreferences);

      // Assert
      expect(updatedPreferences).toBeDefined();
      expect(updatedPreferences.userId).toBe(userId);
      expect(updatedPreferences.theme).toBe('light');
      expect(updatedPreferences.fontSize).toBe(14);

      // Verify with direct database query
      const dbPreferences = await prisma.userPreference.findUnique({
        where: { userId }
      });
      expect(dbPreferences?.theme).toBe('light');
      expect(dbPreferences?.fontSize).toBe(14);
    });

    it('should create new preferences if they do not exist', async () => {
      // Arrange
      const userId = testUsers[1].id;
      const updateData = {
        theme: 'dark',
        fontSize: 20
      };

      // Act
      const newPreferences = await repository.updateUserPreferences(userId, updateData);
      testPreferences.push(newPreferences);

      // Assert
      expect(newPreferences).toBeDefined();
      expect(newPreferences.userId).toBe(userId);
      expect(newPreferences.theme).toBe('dark');
      expect(newPreferences.fontSize).toBe(20);

      // Verify with direct database query
      const dbPreferences = await prisma.userPreference.findUnique({
        where: { userId }
      });
      expect(dbPreferences?.theme).toBe('dark');
      expect(dbPreferences?.fontSize).toBe(20);
    });

    it('should use default values for fields not provided in update data', async () => {
      // Arrange
      const userId = uuidv4();
      await prisma.user.create({
        data: {
          id: userId,
          email: `preference_partial_update@example.com`,
          password: 'password',
          name: `Partial Update User`,
          role: UserRole.PLAYER,
        },
      });
      testUsers.push({ id: userId });

      const updateData = {
        // Only updating theme, fontSize should get default value
        theme: 'light'
      };

      // Act
      const newPreferences = await repository.updateUserPreferences(userId, updateData);
      testPreferences.push(newPreferences);

      // Assert
      expect(newPreferences).toBeDefined();
      expect(newPreferences.userId).toBe(userId);
      expect(newPreferences.theme).toBe('light');
      expect(newPreferences.fontSize).toBe(16); // Default value
    });
  });

  describe('resetUserPreferences', () => {
    it('should reset existing preferences to default values', async () => {
      // Arrange
      const userId = testUsers[0].id;
      
      // First, ensure the preferences are non-default
      await repository.updateUserPreferences(userId, {
        theme: 'dark',
        fontSize: 20
      });

      // Act
      const resetPreferences = await repository.resetUserPreferences(userId);

      // Assert
      expect(resetPreferences).toBeDefined();
      expect(resetPreferences.userId).toBe(userId);
      expect(resetPreferences.theme).toBe('system'); // Default theme
      expect(resetPreferences.fontSize).toBe(16); // Default font size

      // Verify with direct database query
      const dbPreferences = await prisma.userPreference.findUnique({
        where: { userId }
      });
      expect(dbPreferences?.theme).toBe('system');
      expect(dbPreferences?.fontSize).toBe(16);
    });

    it('should create new preferences with default values if they do not exist', async () => {
      // Arrange
      const userId = testUsers[2].id;

      // Act
      const newPreferences = await repository.resetUserPreferences(userId);
      testPreferences.push(newPreferences);

      // Assert
      expect(newPreferences).toBeDefined();
      expect(newPreferences.userId).toBe(userId);
      expect(newPreferences.theme).toBe('system'); // Default theme
      expect(newPreferences.fontSize).toBe(16); // Default font size

      // Verify with direct database query
      const dbPreferences = await prisma.userPreference.findUnique({
        where: { userId }
      });
      expect(dbPreferences?.theme).toBe('system');
      expect(dbPreferences?.fontSize).toBe(16);
    });
  });
}); 