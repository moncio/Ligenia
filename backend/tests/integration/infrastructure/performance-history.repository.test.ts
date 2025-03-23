import { PrismaClient, PerformanceHistory, User, UserRole } from '@prisma/client';
import { PerformanceHistoryRepository } from '../../../src/infrastructure/database/prisma/repositories/performance-history.repository';
import { v4 as uuidv4 } from 'uuid';
import { PerformanceHistoryFilter } from '../../../src/core/application/interfaces/repositories/performance-history.repository';

describe('PerformanceHistoryRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PerformanceHistoryRepository;
  let testUsers: { id: string }[] = [];
  let testPerformances: PerformanceHistory[] = [];
  const currentYear = new Date().getFullYear();

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PerformanceHistoryRepository(prisma);

    // Create test users
    testUsers = await Promise.all(
      Array(3).fill(0).map(async (_, i) => {
        const userId = uuidv4();
        await prisma.user.create({
          data: {
            id: userId,
            email: `performance_test${i}@example.com`,
            password: 'password',
            name: `Performance Test User ${i}`,
            role: UserRole.PLAYER,
          },
        });
        return { id: userId };
      })
    );

    // Create test performance records
    // First user: entries for all months in current year
    for (let month = 1; month <= 12; month++) {
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
    }

    // Second user: entries for first quarter
    for (let month = 1; month <= 3; month++) {
      const performanceId = uuidv4();
      const perf = await prisma.performanceHistory.create({
        data: {
          id: performanceId,
          userId: testUsers[1].id,
          year: currentYear,
          month: month,
          matchesPlayed: 5 * month,
          wins: 3 * month,
          losses: 2 * month,
          points: 9 * month
        }
      });
      testPerformances.push(perf);
    }

    // Annual summary for second user
    const annualPerfId = uuidv4();
    const annualPerf = await prisma.performanceHistory.create({
      data: {
        id: annualPerfId,
        userId: testUsers[1].id,
        year: currentYear,
        month: null,
        matchesPlayed: 30,
        wins: 18,
        losses: 12,
        points: 54
      }
    });
    testPerformances.push(annualPerf);

    // Third user has no performance records
  });

  afterAll(async () => {
    // Clean up test data
    for (const performance of testPerformances) {
      try {
        await prisma.performanceHistory.delete({
          where: { id: performance.id }
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

  describe('create', () => {
    it('should create a new performance history record', async () => {
      // Arrange
      const data = {
        userId: testUsers[2].id,
        year: currentYear,
        month: 1,
        matchesPlayed: 10,
        wins: 6,
        losses: 4,
        points: 18
      };

      // Act
      const created = await repository.create(data);
      testPerformances.push(created);

      // Assert
      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.userId).toBe(data.userId);
      expect(created.year).toBe(data.year);
      expect(created.month).toBe(data.month);
      expect(created.matchesPlayed).toBe(data.matchesPlayed);
      expect(created.wins).toBe(data.wins);
      expect(created.losses).toBe(data.losses);
      expect(created.points).toBe(data.points);
    });

    it('should update existing record if userId, year, and month match', async () => {
      // Arrange
      const data = {
        userId: testUsers[2].id,
        year: currentYear,
        month: 1,
        matchesPlayed: 15,
        wins: 10,
        losses: 5,
        points: 30
      };

      // Act
      const updated = await repository.create(data);

      // Assert
      expect(updated).toBeDefined();
      expect(updated.matchesPlayed).toBe(data.matchesPlayed);
      expect(updated.wins).toBe(data.wins);
      expect(updated.losses).toBe(data.losses);
      expect(updated.points).toBe(data.points);
    });
  });

  describe('findById', () => {
    it('should find a performance history record by id', async () => {
      // Arrange
      const testRecord = testPerformances[0];

      // Act
      const found = await repository.findById(testRecord.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id).toBe(testRecord.id);
      expect(found?.userId).toBe(testRecord.userId);
    });

    it('should return null for a non-existent id', async () => {
      // Act
      const found = await repository.findById('non-existent-id');

      // Assert
      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find all performance records for a user', async () => {
      // Act
      const records = await repository.findByUserId(testUsers[0].id);

      // Assert
      expect(records).toBeDefined();
      expect(records.length).toBe(12); // 12 months for first user
      expect(records[0].userId).toBe(testUsers[0].id);
    });

    it('should filter by year and month', async () => {
      // Arrange
      const filter: PerformanceHistoryFilter = {
        year: currentYear,
        month: 3
      };

      // Act
      const records = await repository.findByUserId(testUsers[0].id, filter);

      // Assert
      expect(records).toBeDefined();
      expect(records.length).toBe(1);
      expect(records[0].month).toBe(3);
    });

    it('should apply pagination', async () => {
      // Arrange
      const filter: PerformanceHistoryFilter = {
        limit: 3,
        offset: 0
      };

      // Act
      const records = await repository.findByUserId(testUsers[0].id, filter);

      // Assert
      expect(records).toBeDefined();
      expect(records.length).toBe(3);
    });

    it('should return empty array for non-existent user', async () => {
      // Act
      const records = await repository.findByUserId('non-existent-user');

      // Assert
      expect(records).toBeDefined();
      expect(records.length).toBe(0);
    });
  });

  describe('update', () => {
    it('should update a performance history record', async () => {
      // Arrange
      const testRecord = testPerformances[1];
      const updateData = {
        matchesPlayed: 25,
        wins: 20,
        losses: 5,
        points: 60
      };

      // Act
      const updated = await repository.update(testRecord.id, updateData);

      // Assert
      expect(updated).toBeDefined();
      expect(updated.id).toBe(testRecord.id);
      expect(updated.matchesPlayed).toBe(updateData.matchesPlayed);
      expect(updated.wins).toBe(updateData.wins);
      expect(updated.losses).toBe(updateData.losses);
      expect(updated.points).toBe(updateData.points);
    });

    it('should throw an error for non-existent id', async () => {
      // Arrange
      const updateData = {
        matchesPlayed: 25,
        wins: 20,
        losses: 5,
        points: 60
      };

      // Act & Assert
      await expect(repository.update('non-existent-id', updateData)).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete a performance history record', async () => {
      // Arrange
      // Create a temporary record to delete
      const tempData = {
        userId: testUsers[0].id,
        year: currentYear - 1,
        month: 1,
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        points: 9
      };
      const toDelete = await repository.create(tempData);

      // Act
      await repository.delete(toDelete.id);

      // Assert
      const found = await repository.findById(toDelete.id);
      expect(found).toBeNull();
    });

    it('should throw an error for non-existent id', async () => {
      // Act & Assert
      await expect(repository.delete('non-existent-id')).rejects.toThrow();
    });
  });

  describe('findPerformanceSummary', () => {
    it('should return a summary of performance for a user', async () => {
      // Act
      const summary = await repository.findPerformanceSummary(testUsers[0].id);

      // Assert
      expect(summary).toBeDefined();
      expect(summary.userId).toBe(testUsers[0].id);
      expect(summary.totalMatches).toBeGreaterThan(0);
      expect(summary.totalWins).toBeGreaterThan(0);
      expect(summary.totalLosses).toBeGreaterThan(0);
      expect(summary.winRate).toBeGreaterThan(0);
      expect(summary.avgPointsPerMonth).toBeGreaterThan(0);
      expect(summary.bestMonth).toBeDefined();
    });

    it('should filter by year', async () => {
      // Act
      const summary = await repository.findPerformanceSummary(testUsers[0].id, currentYear);

      // Assert
      expect(summary).toBeDefined();
      expect(summary.year).toBe(currentYear);
    });

    it('should return default values for a user with no performance records', async () => {
      // Create a new user with no performance records
      const emptyUserId = uuidv4();
      await prisma.user.create({
        data: {
          id: emptyUserId,
          email: 'empty_user@example.com',
          password: 'password',
          name: 'Empty User',
          role: UserRole.PLAYER,
        },
      });
      testUsers.push({ id: emptyUserId });

      // Act
      const summary = await repository.findPerformanceSummary(emptyUserId);

      // Assert
      expect(summary).toBeDefined();
      expect(summary.userId).toBe(emptyUserId);
      expect(summary.totalMatches).toBe(0);
      expect(summary.totalWins).toBe(0);
      expect(summary.totalLosses).toBe(0);
      expect(summary.winRate).toBe(0);
      expect(summary.avgPointsPerMonth).toBe(0);
      expect(summary.bestMonth).toBeUndefined();
    });
  });

  describe('findPerformanceTrends', () => {
    it('should return monthly performance trends by default', async () => {
      // Act
      const trends = await repository.findPerformanceTrends(testUsers[0].id);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.length).toBe(12); // 12 months
      expect(trends[0].period).toContain(currentYear.toString());
      expect(trends[0].matchesPlayed).toBeGreaterThan(0);
    });

    it('should return yearly performance trends', async () => {
      // Act
      const trends = await repository.findPerformanceTrends(testUsers[0].id, 'yearly');

      // Assert
      expect(trends).toBeDefined();
      expect(trends.length).toBe(1); // 1 year
      expect(trends[0].period).toBe(currentYear.toString());
      expect(trends[0].matchesPlayed).toBeGreaterThan(0);
    });

    it('should return empty array for a user with no performance records', async () => {
      // Create a new user with no performance records
      const emptyUserId = uuidv4();
      await prisma.user.create({
        data: {
          id: emptyUserId,
          email: 'empty_trends_user@example.com',
          password: 'password',
          name: 'Empty Trends User',
          role: UserRole.PLAYER,
        },
      });
      testUsers.push({ id: emptyUserId });

      // Act
      const trends = await repository.findPerformanceTrends(emptyUserId);

      // Assert
      expect(trends).toBeDefined();
      expect(trends.length).toBe(0);
    });
  });
}); 