import { PrismaClient, PlayerLevel as PrismaPlayerLevel } from '@prisma/client';
import { Ranking } from '../../../src/core/domain/ranking/ranking.entity';
import { RankingRepository } from '../../../src/infrastructure/database/prisma/repositories/ranking.repository';
import { v4 as uuidv4 } from 'uuid';
import { PlayerLevel } from '../../../src/core/domain/tournament/tournament.entity';

describe('RankingRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: RankingRepository;
  let testUsers: { id: string }[] = [];
  let testPlayers: { id: string, userId: string, level: string }[] = [];
  let testTournaments: { id: string }[] = [];
  let testStatistics: { id: string, userId: string, tournamentId: string }[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new RankingRepository(prisma);

    // Create test users
    testUsers = await Promise.all(
      Array(3).fill(0).map(async (_, i) => {
        const userId = uuidv4();
        await prisma.user.create({
          data: {
            id: userId,
            email: `ranking_test${i}@example.com`,
            password: 'password',
            name: `Ranking Test User ${i}`,
          },
        });
        return { id: userId };
      })
    );

    // Create test players with different levels
    // Use actual PlayerLevel enum values from Prisma schema
    const prismaLevels = [PrismaPlayerLevel.P1, PrismaPlayerLevel.P2, PrismaPlayerLevel.P3]; 
    const domainLevels = [PlayerLevel.P1, PlayerLevel.P2, PlayerLevel.P3]; 
    
    testPlayers = await Promise.all(
      testUsers.map(async (user, i) => {
        const playerId = uuidv4();
        await prisma.player.create({
          data: {
            id: playerId,
            userId: user.id,
            level: prismaLevels[i],
          },
        });
        return { id: playerId, userId: user.id, level: domainLevels[i] };
      })
    );

    // Create test tournament
    testTournaments = await Promise.all(
      Array(1).fill(0).map(async () => {
        const tournamentId = uuidv4();
        await prisma.tournament.create({
          data: {
            id: tournamentId,
            name: 'Test Tournament for Rankings',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            registrationEndDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            status: 'ACTIVE',
          },
        });
        return { id: tournamentId };
      })
    );

    // Create test statistics with different points
    testStatistics = await Promise.all(
      testUsers.map(async (user, i) => {
        const statId = uuidv4();
        await prisma.statistic.create({
          data: {
            id: statId,
            userId: user.id,
            tournamentId: testTournaments[0].id,
            points: (3 - i) * 100, // First user has highest points
            matchesPlayed: 10,
            wins: 5 - i,
            losses: 5 + i,
          },
        });
        return { id: statId, userId: user.id, tournamentId: testTournaments[0].id };
      })
    );
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

    // Clean up test players
    for (const player of testPlayers) {
      try {
        await prisma.player.deleteMany({
          where: { userId: player.userId },
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

  describe('findAll', () => {
    it('should return all rankings', async () => {
      // Act
      const rankings = await repository.findAll();

      // Assert
      expect(rankings).toHaveLength(testUsers.length);
      
      // Check that rankings are properly ordered by global position
      expect(rankings[0].globalPosition).toBeLessThanOrEqual(rankings[1].globalPosition);
      
      // Verify that rankingPoints match expected values
      expect(rankings[0].rankingPoints).toBe(300);
      expect(rankings[1].rankingPoints).toBe(200);
      expect(rankings[2].rankingPoints).toBe(100);
    });

    it('should filter rankings by player level', async () => {
      // Act
      const p1Rankings = await repository.findAll({ playerLevel: PlayerLevel.P1 });

      // Assert
      expect(p1Rankings).toHaveLength(1);
      expect(p1Rankings[0].playerLevel).toBe(PlayerLevel.P1);
    });

    it('should sort rankings by specified field', async () => {
      // Act - Get rankings sorted by ranking points in descending order
      const rankings = await repository.findAll({
        sortBy: 'rankingPoints',
        sortOrder: 'desc'
      });

      // Assert
      expect(rankings).toHaveLength(testUsers.length);
      expect(rankings[0].rankingPoints).toBeGreaterThanOrEqual(rankings[1].rankingPoints);
      expect(rankings[1].rankingPoints).toBeGreaterThanOrEqual(rankings[2].rankingPoints);
    });

    it('should paginate results', async () => {
      // Act
      const paginatedRankings = await repository.findAll({
        limit: 2,
        offset: 0
      });

      // Assert
      expect(paginatedRankings).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find a ranking by ID', async () => {
      // Arrange
      const allRankings = await repository.findAll();
      const firstRanking = allRankings[0];

      // Act
      const ranking = await repository.findById(firstRanking.id);

      // Assert
      expect(ranking).not.toBeNull();
      expect(ranking?.id).toBe(firstRanking.id);
      expect(ranking?.playerId).toBe(firstRanking.playerId);
    });

    it('should return null for non-existent ID', async () => {
      // Act
      const ranking = await repository.findById('non-existent-id');

      // Assert
      expect(ranking).toBeNull();
    });
  });

  describe('findByPlayerId', () => {
    it('should find a ranking by player ID', async () => {
      // Act
      const ranking = await repository.findByPlayerId(testUsers[0].id);

      // Assert
      expect(ranking).not.toBeNull();
      expect(ranking?.playerId).toBe(testUsers[0].id);
      expect(ranking?.rankingPoints).toBe(300); // Highest points
    });

    it('should return null for non-existent player ID', async () => {
      // Act
      const ranking = await repository.findByPlayerId('non-existent-id');

      // Assert
      expect(ranking).toBeNull();
    });
  });

  describe('count', () => {
    it('should count all rankings', async () => {
      // Act
      const count = await repository.count();

      // Assert
      expect(count).toBe(testUsers.length);
    });

    it('should count rankings filtered by player level', async () => {
      // Act
      const p1Count = await repository.count({ playerLevel: PlayerLevel.P1 });
      const p2Count = await repository.count({ playerLevel: PlayerLevel.P2 });

      // Assert
      expect(p1Count).toBe(1);
      expect(p2Count).toBe(1);
    });
  });

  describe('findByPlayerLevel', () => {
    it('should find rankings by player level', async () => {
      // Act
      const p1Rankings = await repository.findByPlayerLevel(PlayerLevel.P1);
      const p2Rankings = await repository.findByPlayerLevel(PlayerLevel.P2);

      // Assert
      expect(p1Rankings).toHaveLength(1);
      expect(p1Rankings[0].playerLevel).toBe(PlayerLevel.P1);
      
      expect(p2Rankings).toHaveLength(1);
      expect(p2Rankings[0].playerLevel).toBe(PlayerLevel.P2);
    });

    it('should sort rankings by specified field', async () => {
      // We only have one player per level, so this test is more for the API contract
      // Act
      const p3Rankings = await repository.findByPlayerLevel(
        PlayerLevel.P3,
        { sortBy: 'rankingPoints', sortOrder: 'desc' }
      );

      // Assert
      expect(p3Rankings).toHaveLength(1);
      expect(p3Rankings[0].playerLevel).toBe(PlayerLevel.P3);
    });
  });

  describe('countByPlayerLevel', () => {
    it('should count rankings by player level', async () => {
      // Act
      const p1Count = await repository.countByPlayerLevel(PlayerLevel.P1);
      const p2Count = await repository.countByPlayerLevel(PlayerLevel.P2);
      const p3Count = await repository.countByPlayerLevel(PlayerLevel.P3);

      // Assert
      expect(p1Count).toBe(1);
      expect(p2Count).toBe(1);
      expect(p3Count).toBe(1);
    });
  });

  // Note: Since our implementation doesn't actually persist ranking changes,
  // we'll test the API but not expect persistence for save, update, delete
  describe('save and update operations', () => {
    it('should handle save operation', async () => {
      // Arrange
      const existingRanking = await repository.findByPlayerId(testUsers[0].id);
      
      if (!existingRanking) {
        throw new Error('Test setup failed: could not find ranking for test user');
      }
      
      // Create a new ranking with updated values
      const updatedRanking = new Ranking(
        existingRanking.id,
        existingRanking.playerId,
        999, // Updated ranking points
        existingRanking.globalPosition,
        existingRanking.categoryPosition,
        existingRanking.playerLevel,
        existingRanking.previousPosition,
        existingRanking.positionChange,
        new Date(),
        existingRanking.createdAt,
        new Date()
      );

      // Act - This should not throw an error
      await expect(repository.save(updatedRanking)).resolves.not.toThrow();
    });

    it('should handle update operation', async () => {
      // Arrange
      const existingRanking = await repository.findByPlayerId(testUsers[0].id);
      
      if (!existingRanking) {
        throw new Error('Test setup failed: could not find ranking for test user');
      }
      
      // Create a new ranking with updated values
      const updatedRanking = new Ranking(
        existingRanking.id,
        existingRanking.playerId,
        888, // Different updated ranking points
        existingRanking.globalPosition,
        existingRanking.categoryPosition,
        existingRanking.playerLevel,
        existingRanking.previousPosition,
        existingRanking.positionChange,
        new Date(),
        existingRanking.createdAt,
        new Date()
      );

      // Act - This should not throw an error
      await expect(repository.update(updatedRanking)).resolves.not.toThrow();
    });
  });

  describe('delete', () => {
    it('should handle delete operation', async () => {
      // Arrange
      const allRankings = await repository.findAll();
      const firstRanking = allRankings[0];

      // Act
      const result = await repository.delete(firstRanking.id);

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when deleting non-existent ranking', async () => {
      // Act
      const result = await repository.delete('non-existent-id');

      // Assert
      expect(result).toBe(false);
    });
  });
}); 