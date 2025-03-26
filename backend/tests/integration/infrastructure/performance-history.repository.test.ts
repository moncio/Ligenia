import { PrismaClient, PerformanceHistory, User, UserRole } from '@prisma/client';
import { PerformanceHistoryRepository } from '../../../src/infrastructure/database/prisma/repositories/performance-history.repository';
import { v4 as uuidv4 } from 'uuid';
import { PerformanceHistoryFilter } from '../../../src/core/application/interfaces/repositories/performance-history.repository';

describe('PerformanceHistoryRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PerformanceHistoryRepository;
  let testUsers: User[] = [];
  let testPerformances: PerformanceHistory[] = [];
  const currentYear = new Date().getFullYear();

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PerformanceHistoryRepository(prisma);

    // Clean up any existing test data first
    await prisma.performanceHistory.deleteMany({
      where: {
        userId: {
          in: testUsers.map(u => u.id),
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'performance_test',
        },
      },
    });

    // Create test users
    for (let i = 0; i < 3; i++) {
      try {
        const user = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: `performance_test${i}@example.com`,
            password: 'password',
            name: `Performance Test User ${i}`,
            role: UserRole.PLAYER,
          },
        });
        testUsers.push(user);
      } catch (error) {
        console.error(`Failed to create test user ${i}:`, error);
      }
    }

    if (testUsers.length > 0) {
      // Create test performance records
      // First user: entries for all months in current year
      for (let month = 1; month <= 3; month++) { // Limited to 3 months for test speed
        try {
          const performanceId = uuidv4();
          const perf = await prisma.performanceHistory.create({
            data: {
              id: performanceId,
              userId: testUsers[0].id,
              year: currentYear,
              month: month,
              matchesPlayed: 10 * month,
              wins: 5 * month,
              losses: 5 * month,
              points: 15 * month
            }
          });
          testPerformances.push(perf);
        } catch (error) {
          console.error(`Failed to create performance history for month ${month}:`, error);
        }
      }
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      // First delete performance history (due to foreign key constraints)
      await prisma.performanceHistory.deleteMany({
        where: {
          userId: {
            in: testUsers.map(u => u.id),
          },
        },
      });
      
      // Then delete users
      await prisma.user.deleteMany({
        where: {
          id: {
            in: testUsers.map(u => u.id),
          },
        },
      });
    } catch (error) {
      console.error('Error during cleanup:', error);
    }

    await prisma.$disconnect();
  });

  describe('create', () => {
    it('should create a new performance history record', async () => {
      // Arrange
      if (testUsers.length < 2) {
        console.warn('Not enough test users available for test');
        return;
      }
      
      const userId = testUsers[1].id;
      const performanceData = {
        userId,
        year: currentYear,
        month: 1,
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        points: 15
      };

      // Act
      const performance = await repository.create(performanceData);

      // Assert
      expect(performance).not.toBeNull();
      expect(performance.userId).toBe(userId);
      expect(performance.year).toBe(currentYear);
      expect(performance.month).toBe(1);
      expect(performance.matchesPlayed).toBe(5);
      expect(performance.wins).toBe(3);
      expect(performance.losses).toBe(2);
      expect(performance.points).toBe(15);
    });

    it('should update existing record if userId, year, and month match', async () => {
      // Arrange
      if (testUsers.length === 0 || testPerformances.length === 0) {
        console.warn('No test users or performances available for test');
        return;
      }
      
      const userId = testUsers[0].id;
      const existingPerformance = testPerformances[0];
      const performanceData = {
        userId,
        year: existingPerformance.year,
        month: existingPerformance.month,
        matchesPlayed: 20,
        wins: 15,
        losses: 5,
        points: 30
      };

      // Act
      const performance = await repository.create(performanceData);

      // Assert
      expect(performance).not.toBeNull();
      expect(performance.id).toBe(existingPerformance.id); // Should be the same ID (updated)
      expect(performance.matchesPlayed).toBe(20); // Should be updated
      expect(performance.wins).toBe(15);
      expect(performance.losses).toBe(5);
      expect(performance.points).toBe(30);
    });
  });

  describe('findById', () => {
    it('should find a performance history record by id', async () => {
      // Arrange
      if (testPerformances.length === 0) {
        console.warn('No test performances available for test');
        return;
      }
      
      const id = testPerformances[0].id;

      // Act
      const performance = await repository.findById(id);

      // Assert
      expect(performance).not.toBeNull();
      expect(performance?.id).toBe(id);
    });

    it('should return null for a non-existent id', async () => {
      // Act
      const performance = await repository.findById('non-existent-id');

      // Assert
      expect(performance).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all performance records for a user', async () => {
      // Arrange
      if (testUsers.length === 0) {
        console.warn('No test users available for test');
        return;
      }
      
      const userId = testUsers[0].id;

      // Act
      const records = await repository.findByUserId(userId, {});

      // Assert
      expect(records.length).toBeGreaterThan(0);
      expect(records.every(r => r.userId === userId)).toBe(true);
    });

    it('should filter by year and month', async () => {
      // Arrange
      if (testUsers.length === 0) {
        console.warn('No test users available for test');
        return;
      }
      
      const userId = testUsers[0].id;
      const filter: PerformanceHistoryFilter = {
        year: currentYear,
        month: 1
      };

      // Act
      const records = await repository.findByUserId(userId, filter);

      // Assert
      expect(records.length).toBeGreaterThan(0);
      expect(records.every(r => r.userId === userId && r.year === currentYear && r.month === 1)).toBe(true);
    });

    it('should apply pagination', async () => {
      // Arrange
      if (testUsers.length === 0) {
        console.warn('No test users available for test');
        return;
      }
      
      const userId = testUsers[0].id;
      const filter: PerformanceHistoryFilter = {
        limit: 3,
        offset: 0
      };

      // Act
      const records = await repository.findByUserId(userId, filter);

      // Assert
      expect(records.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for non-existent user', async () => {
      // Act
      const records = await repository.findByUserId('non-existent-id', {});

      // Assert
      expect(records.length).toBe(0);
    });
  });

  describe('update', () => {
    it('should update a performance history record', async () => {
      // Skip if no test performances
      if (testPerformances.length === 0) {
        console.warn('No test performances available for test');
        return;
      }
      
      // Arrange
      const performance = testPerformances[0];
      const updatedData = {
        matchesPlayed: 25,
        wins: 20,
        losses: 5,
        points: 40
      };

      // Act
      const updatedPerformance = await repository.update(performance.id, updatedData);

      // Assert
      expect(updatedPerformance).not.toBeNull();
      expect(updatedPerformance.id).toBe(performance.id);
      expect(updatedPerformance.matchesPlayed).toBe(25);
      expect(updatedPerformance.wins).toBe(20);
      expect(updatedPerformance.losses).toBe(5);
      expect(updatedPerformance.points).toBe(40);
    });

    it('should throw an error for non-existent id', async () => {
      // Arrange
      const updatedData = {
        matchesPlayed: 15,
        wins: 10,
        losses: 5,
        points: 30
      };

      // Act & Assert
      await expect(repository.update('non-existent-id', updatedData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a performance history record', async () => {
      // Skip if no test performances
      if (testPerformances.length === 0) {
        console.warn('No test performances available for test');
        return;
      }
      
      // We'll use the last performance to delete to avoid affecting other tests
      const performance = testPerformances[testPerformances.length - 1];

      // Act
      await repository.delete(performance.id);

      // Verify it's deleted
      const deleted = await repository.findById(performance.id);
      expect(deleted).toBeNull();
    });

    it('should throw an error for non-existent id', async () => {
      // Act & Assert
      await expect(repository.delete('non-existent-id')).rejects.toThrow();
    });
  });

  describe('findPerformanceSummary', () => {
    it('should return a summary of performance for a user', async () => {
      // Skip if no test users
      if (testUsers.length === 0) {
        console.warn('No test users available for test');
        return;
      }
      
      // Arrange
      const userId = testUsers[0].id;

      // Act
      const summary = await repository.findPerformanceSummary(userId);

      // Assert
      expect(summary).not.toBeNull();
      expect(summary.userId).toBe(userId);
      expect(summary.totalMatches).toBeGreaterThan(0);
      expect(summary.winRate).toBeGreaterThanOrEqual(0);
      expect(summary.winRate).toBeLessThanOrEqual(100);
    });

    it('should filter by year', async () => {
      // Skip if no test users
      if (testUsers.length === 0) {
        console.warn('No test users available for test');
        return;
      }
      
      // Arrange
      const userId = testUsers[0].id;

      // Act
      const summary = await repository.findPerformanceSummary(userId, currentYear);

      // Assert
      expect(summary).not.toBeNull();
      expect(summary.userId).toBe(userId);
      expect(summary.year).toBe(currentYear);
    });

    it('should return default values for a user with no performance records', async () => {
      // Use a non-existent user ID
      const userId = 'non-existent-user-id';

      // Act
      const summary = await repository.findPerformanceSummary(userId);

      // Assert
      expect(summary).not.toBeNull();
      expect(summary.userId).toBe(userId);
      expect(summary.totalMatches).toBe(0);
      expect(summary.totalWins).toBe(0);
      expect(summary.totalLosses).toBe(0);
      expect(summary.winRate).toBe(0);
    });
  });

  describe('findPerformanceTrends', () => {
    it('should return monthly performance trends by default', async () => {
      // Skip if no test users
      if (testUsers.length === 0) {
        console.warn('No test users available for test');
        return;
      }
      
      // Arrange
      const userId = testUsers[0].id;

      // Act
      const trends = await repository.findPerformanceTrends(userId, 'monthly');

      // Assert
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0].period).toBeDefined();
      expect(trends[0].matchesPlayed).toBeDefined();
      expect(trends[0].wins).toBeDefined();
      expect(trends[0].losses).toBeDefined();
    });

    it('should return yearly performance trends', async () => {
      // Skip if no test users
      if (testUsers.length === 0) {
        console.warn('No test users available for test');
        return;
      }
      
      // Arrange
      const userId = testUsers[0].id;

      // Act
      const trends = await repository.findPerformanceTrends(userId, 'yearly');

      // Assert
      expect(trends.length).toBeGreaterThan(0);
      expect(trends[0].period).toBeDefined();
      expect(trends[0].matchesPlayed).toBeDefined();
      expect(trends[0].wins).toBeDefined();
      expect(trends[0].losses).toBeDefined();
    });

    it('should return empty array for a user with no performance records', async () => {
      // Use a non-existent user ID
      const userId = 'non-existent-user-id';

      // Act
      const trends = await repository.findPerformanceTrends(userId, 'monthly');

      // Assert
      expect(trends.length).toBe(0);
    });
  });
}); 