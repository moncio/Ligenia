import { PrismaClient } from '@prisma/client';
import { Statistic } from '../../../src/core/domain/statistic/statistic.entity';
import { StatisticRepository } from '../../../src/infrastructure/database/prisma/repositories/statistic.repository';
import { v4 as uuidv4 } from 'uuid';

describe('StatisticRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: StatisticRepository;
  let testUsers: { id: string }[] = [];
  let testTournaments: { id: string }[] = [];
  let testStatistics: Statistic[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new StatisticRepository(prisma);

    // Create test users
    testUsers = await Promise.all(
      Array(2).fill(0).map(async (_, i) => {
        const userId = uuidv4();
        await prisma.user.create({
          data: {
            id: userId,
            email: `stat_test${i}@example.com`,
            password: 'password',
            name: `Stat Test User ${i}`,
          },
        });
        return { id: userId };
      })
    );

    // Create test tournaments
    testTournaments = await Promise.all(
      Array(2).fill(0).map(async (_, i) => {
        const tournamentId = uuidv4();
        await prisma.tournament.create({
          data: {
            id: tournamentId,
            name: `Test Tournament ${i}`,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            registrationEndDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
          },
        });
        return { id: tournamentId };
      })
    );

    // Create test statistics
    testStatistics = [
      new Statistic(
        uuidv4(),
        testUsers[0].id,
        10, // matchesPlayed
        7,  // matchesWon
        3,  // matchesLost
        100, // totalPoints
        10, // averageScore
        2,  // tournamentsPlayed
        1,  // tournamentsWon
        70, // winRate
        new Date(), // lastUpdated
        new Date(), // createdAt
        new Date(), // updatedAt
      ),
      new Statistic(
        uuidv4(),
        testUsers[1].id,
        5, // matchesPlayed
        2, // matchesWon
        3, // matchesLost
        40, // totalPoints
        8, // averageScore
        1, // tournamentsPlayed
        0, // tournamentsWon
        40, // winRate
        new Date(), // lastUpdated
        new Date(), // createdAt
        new Date(), // updatedAt
      ),
    ];
  });

  afterAll(async () => {
    // Clean up test data
    for (const statistic of testStatistics) {
      try {
        await prisma.statistic.delete({
          where: { id: statistic.id },
        });
      } catch (error) {
        // Ignore errors if the record doesn't exist
      }
    }

    // Clean up test tournaments
    for (const tournament of testTournaments) {
      try {
        await prisma.tournament.delete({
          where: { id: tournament.id },
        });
      } catch (error) {
        // Ignore errors if the record doesn't exist
      }
    }

    // Clean up test users
    for (const user of testUsers) {
      try {
        await prisma.user.delete({
          where: { id: user.id },
        });
      } catch (error) {
        // Ignore errors if the record doesn't exist
      }
    }

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean statistics before each test
    try {
      await prisma.statistic.deleteMany({
        where: { id: { in: testStatistics.map(s => s.id) } },
      });
    } catch (error) {
      // Ignore errors
    }

    // Add users to tournaments for each test
    await Promise.all(testUsers.map(user => 
      prisma.tournament.update({
        where: { id: testTournaments[0].id },
        data: {
          participants: {
            connect: { id: user.id }
          }
        }
      })
    ));
  });

  describe('save', () => {
    it('should save a new statistic', async () => {
      // Act
      await repository.save(testStatistics[0], testTournaments[0].id);

      // Assert
      const savedStatistic = await prisma.statistic.findUnique({
        where: { id: testStatistics[0].id },
      });

      expect(savedStatistic).not.toBeNull();
      expect(savedStatistic?.id).toBe(testStatistics[0].id);
      expect(savedStatistic?.userId).toBe(testStatistics[0].playerId);
      expect(savedStatistic?.matchesPlayed).toBe(testStatistics[0].matchesPlayed);
      expect(savedStatistic?.wins).toBe(testStatistics[0].matchesWon);
      expect(savedStatistic?.losses).toBe(testStatistics[0].matchesLost);
      expect(savedStatistic?.points).toBe(testStatistics[0].totalPoints);
    });

    it('should update an existing statistic', async () => {
      // Arrange
      await repository.save(testStatistics[0], testTournaments[0].id);

      // Create an updated version of the statistic
      const updatedStatistic = new Statistic(
        testStatistics[0].id,
        testStatistics[0].playerId,
        15, // Updated matchesPlayed
        10, // Updated matchesWon
        5,  // Updated matchesLost
        120, // Updated totalPoints
        8,  // Updated averageScore
        3,  // Updated tournamentsPlayed
        1,  // Updated tournamentsWon
        67, // Updated winRate
        new Date(), // Updated lastUpdated
        testStatistics[0].createdAt,
        new Date(), // Updated updatedAt
      );

      // Act
      await repository.update(updatedStatistic);

      // Assert
      const savedStatistic = await prisma.statistic.findUnique({
        where: { id: testStatistics[0].id },
      });

      expect(savedStatistic).not.toBeNull();
      expect(savedStatistic?.matchesPlayed).toBe(15);
      expect(savedStatistic?.wins).toBe(10);
      expect(savedStatistic?.losses).toBe(5);
      expect(savedStatistic?.points).toBe(120);
    });
  });

  describe('findById', () => {
    it('should find a statistic by id', async () => {
      // Arrange
      await repository.save(testStatistics[0], testTournaments[0].id);

      // Act
      const statistic = await repository.findById(testStatistics[0].id);

      // Assert
      expect(statistic).not.toBeNull();
      expect(statistic?.id).toBe(testStatistics[0].id);
      expect(statistic?.playerId).toBe(testStatistics[0].playerId);
      expect(statistic?.matchesPlayed).toBe(testStatistics[0].matchesPlayed);
    });

    it('should return null for non-existing id', async () => {
      // Act
      const statistic = await repository.findById('non-existent-id');

      // Assert
      expect(statistic).toBeNull();
    });
  });

  describe('findByPlayerId', () => {
    it('should find statistics by player id', async () => {
      // Arrange
      await repository.save(testStatistics[0], testTournaments[0].id);

      // Act
      const statistic = await repository.findByPlayerId(testStatistics[0].playerId);

      // Assert
      expect(statistic).not.toBeNull();
      expect(statistic?.playerId).toBe(testStatistics[0].playerId);
    });
  });

  describe('findByTournamentId', () => {
    it('should find statistics for a tournament', async () => {
      // Arrange
      // Create statistics for both users in the same tournament
      await prisma.statistic.create({
        data: {
          id: testStatistics[0].id,
          userId: testUsers[0].id,
          tournamentId: testTournaments[0].id,
          matchesPlayed: 10,
          wins: 7,
          losses: 3,
          points: 70,
        }
      });

      await prisma.statistic.create({
        data: {
          id: testStatistics[1].id,
          userId: testUsers[1].id,
          tournamentId: testTournaments[0].id,
          matchesPlayed: 5,
          wins: 2,
          losses: 3,
          points: 20,
        }
      });

      // Act
      const statistics = await repository.findByTournamentId(testTournaments[0].id);

      // Assert
      expect(statistics).toHaveLength(2);
      expect(statistics.find(s => s.playerId === testUsers[0].id)).toBeDefined();
      expect(statistics.find(s => s.playerId === testUsers[1].id)).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a statistic', async () => {
      // Arrange
      await repository.save(testStatistics[0], testTournaments[0].id);

      // Act
      await repository.delete(testStatistics[0].id);

      // Assert
      const deletedStatistic = await prisma.statistic.findUnique({
        where: { id: testStatistics[0].id },
      });

      expect(deletedStatistic).toBeNull();
    });
  });

  describe('count', () => {
    it('should count statistics matching a filter', async () => {
      // Arrange
      // Create statistics for both users in the same tournament
      await prisma.statistic.create({
        data: {
          id: testStatistics[0].id,
          userId: testUsers[0].id,
          tournamentId: testTournaments[0].id,
          matchesPlayed: 10,
          wins: 7,
          losses: 3,
          points: 70,
        }
      });

      await prisma.statistic.create({
        data: {
          id: testStatistics[1].id,
          userId: testUsers[1].id,
          tournamentId: testTournaments[0].id,
          matchesPlayed: 5,
          wins: 2,
          losses: 3,
          points: 20,
        }
      });

      // Act
      const count = await repository.count({ tournamentId: testTournaments[0].id });

      // Assert
      expect(count).toBe(2);
    });
  });

  describe('findAll', () => {
    it('should find all statistics with pagination', async () => {
      // Arrange
      // Create statistics for both users in the same tournament
      await prisma.statistic.create({
        data: {
          id: testStatistics[0].id,
          userId: testUsers[0].id,
          tournamentId: testTournaments[0].id,
          matchesPlayed: 10,
          wins: 7,
          losses: 3,
          points: 70,
        }
      });

      await prisma.statistic.create({
        data: {
          id: testStatistics[1].id,
          userId: testUsers[1].id,
          tournamentId: testTournaments[0].id,
          matchesPlayed: 5,
          wins: 2,
          losses: 3,
          points: 20,
        }
      });

      // Act
      const statistics = await repository.findAll(
        { tournamentId: testTournaments[0].id },
        { skip: 0, limit: 10, sort: { field: 'matchesPlayed', order: 'desc' } }
      );

      // Assert
      expect(statistics).toHaveLength(2);
      // First result should be the one with more matches played
      expect(statistics[0].matchesPlayed).toBeGreaterThan(statistics[1].matchesPlayed);
    });
  });
}); 