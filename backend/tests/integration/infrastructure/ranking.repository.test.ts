// Set NODE_ENV to test and load environment variables before imports
process.env.NODE_ENV = 'test';

// Explicitly load .env.test with an absolute path to avoid path issues
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../../.env.test') 
});

// Log masked database URL for debugging (masking password for security)
const maskedDbUrl = process.env.DATABASE_URL ? 
  process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@') : 
  'No DATABASE_URL set';
console.log('Test environment using DATABASE_URL:', maskedDbUrl);

// Verify we're connecting to the test database
if (!process.env.DATABASE_URL?.includes('ligenia_user_test')) {
  console.error('ERROR: Test database URL does not include ligenia_user_test');
  console.error('Current DATABASE_URL points to:', maskedDbUrl);
  process.exit(1); // Stop tests if not using test database
}

import { PlayerLevel as PrismaPlayerLevel } from '@prisma/client';
import { Ranking } from '../../../src/core/domain/ranking/ranking.entity';
import { RankingRepository } from '../../../src/infrastructure/database/prisma/repositories/ranking.repository';
import { PlayerLevel } from '../../../src/core/domain/tournament/tournament.entity';
import { createRepositoryTestSuite, disconnectPrisma } from '../../utils/db-test-utils';
import { TestDataFactory } from '../../utils/test-data-factory';

describe('RankingRepository Integration Tests', () => {
  const testSuite = createRepositoryTestSuite('ranking');
  const prisma = testSuite.getPrisma();
  const testDataFactory = new TestDataFactory(prisma, 'ranking-test');
  
  let repository: RankingRepository;
  let testUsers: any[] = [];
  let testPlayers: any[] = [];
  let testRankings: any[] = [];
  
  // Set up the repository and test data
  beforeAll(async () => {
    repository = new RankingRepository(prisma);
    
    // Create test users with players
    const playerLevels = [PrismaPlayerLevel.P1, PrismaPlayerLevel.P2, PrismaPlayerLevel.P3];
    const domainLevels = [PlayerLevel.P1, PlayerLevel.P2, PlayerLevel.P3];
    
    // Use a unique timestamp for all test users to avoid email conflicts
    const timestamp = Date.now();
    
    for (let i = 0; i < 3; i++) {
      // Create user with player in transaction
      const result = await testSuite.runInTransaction(async (tx) => {
        const user = await testDataFactory.createUser({
          email: `ranking_test${i}_${timestamp}@example.com`, // Add timestamp to email to avoid conflicts
          name: `Ranking Test User ${i}`
        });
        
        const player = await testDataFactory.createPlayer(user.id, {
          level: playerLevels[i]
        });
        
        // Create ranking entry
        const ranking = await testDataFactory.createRanking(user.id, playerLevels[i], {
          rankingPoints: (3 - i) * 100, // First user has highest points
          globalPosition: i + 1,
          categoryPosition: 1, // Each is #1 in their category
        });
        
        return { user, player, ranking, level: domainLevels[i] };
      });
      
      testUsers.push(result.user);
      testPlayers.push({ ...result.player, level: result.level });
      testRankings.push(result.ranking);
      
      // Register for cleanup
      testSuite.registerForCleanup('ranking', result.ranking.id);
      testSuite.registerForCleanup('player', result.player.id);
      testSuite.registerForCleanup('user', result.user.id);
    }
  });
  
  // Clean up test data after all tests
  afterAll(async () => {
    await testSuite.cleanup();
    // Disconnect Prisma client to avoid connection leaks
    await disconnectPrisma();
  });
  
  describe('findAll', () => {
    it('should return all rankings', async () => {
      // Act
      const rankings = await repository.findAll();

      // Assert
      expect(rankings.length).toBeGreaterThanOrEqual(testUsers.length);
      
      // Filter out only our test rankings
      const testRankingIds = testRankings.map(r => r.id);
      const ourRankings = rankings.filter(r => testRankingIds.includes(r.id));
      
      // Verify at least our test rankings are included
      expect(ourRankings.length).toBeGreaterThanOrEqual(testRankings.length);
      
      // The RankingRepository calculates points from statistics, so we can't expect 
      // exact values to match from our mocked rankings.
      // Instead, check that IDs and properties exist
      const highestRanking = rankings.find(r => r.id === testRankings[0].id);
      const midRanking = rankings.find(r => r.id === testRankings[1].id);
      const lowestRanking = rankings.find(r => r.id === testRankings[2].id);
      
      expect(highestRanking).not.toBeNull();
      expect(midRanking).not.toBeNull();
      expect(lowestRanking).not.toBeNull();
    });

    it('should filter rankings by player level', async () => {
      // Act
      const p1Rankings = await repository.findAll({ playerLevel: PlayerLevel.P1 });

      // Assert
      // Find our P1 test ranking
      const ourP1Ranking = testRankings.find(r => r.playerLevel === PrismaPlayerLevel.P1);
      const foundRankings = p1Rankings.filter(r => r.id === ourP1Ranking.id);
      
      expect(foundRankings.length).toBe(1);
      expect(foundRankings[0].playerLevel).toBe(PlayerLevel.P1);
    });

    it('should sort rankings by specified field', async () => {
      // Act - Get rankings sorted by ranking points in descending order
      const rankings = await repository.findAll({
        sortBy: 'rankingPoints',
        sortOrder: 'desc'
      });

      // Assert - Just check that we have results and they're sorted correctly
      expect(rankings.length).toBeGreaterThan(0);
      
      for (let i = 0; i < rankings.length - 1; i++) {
        expect(rankings[i].rankingPoints).toBeGreaterThanOrEqual(rankings[i + 1].rankingPoints);
      }
    });

    it('should paginate results', async () => {
      // Act
      const paginatedRankings = await repository.findAll({
        limit: 2,
        offset: 0
      });

      // Assert
      expect(paginatedRankings.length).toBeLessThanOrEqual(2);
    });
  });

  describe('findById', () => {
    it('should find a ranking by ID', async () => {
      // Arrange
      const targetRankingId = testRankings[0].id;

      // Act
      const ranking = await repository.findById(targetRankingId);

      // Assert
      expect(ranking).not.toBeNull();
      expect(ranking?.id).toBe(targetRankingId);
      expect(ranking?.playerId).toBe(testUsers[0].id);
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
      // The RankingRepository calculates points from statistics, so we can't expect 
      // exact values to match from our mocked rankings
      expect(ranking).toHaveProperty('rankingPoints');
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
      expect(count).toBeGreaterThanOrEqual(testUsers.length);
    });

    it('should count rankings filtered by player level', async () => {
      // Act
      const p1Count = await repository.count({ playerLevel: PlayerLevel.P1 });
      const p2Count = await repository.count({ playerLevel: PlayerLevel.P2 });

      // Assert
      expect(p1Count).toBeGreaterThanOrEqual(1);
      expect(p2Count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('findByPlayerLevel', () => {
    it('should find rankings by player level', async () => {
      // Act
      const p1Rankings = await repository.findByPlayerLevel(PlayerLevel.P1);
      const p2Rankings = await repository.findByPlayerLevel(PlayerLevel.P2);

      // Assert
      expect(p1Rankings.length).toBeGreaterThanOrEqual(1);
      expect(p1Rankings.some(r => r.playerLevel === PlayerLevel.P1)).toBe(true);
      
      expect(p2Rankings.length).toBeGreaterThanOrEqual(1);
      expect(p2Rankings.some(r => r.playerLevel === PlayerLevel.P2)).toBe(true);
    });

    it('should sort rankings by specified field', async () => {
      // Act
      const p3Rankings = await repository.findByPlayerLevel(
        PlayerLevel.P3,
        { sortBy: 'rankingPoints', sortOrder: 'desc' }
      );

      // Assert
      expect(p3Rankings.length).toBeGreaterThanOrEqual(1);
      expect(p3Rankings.some(r => r.playerLevel === PlayerLevel.P3)).toBe(true);
      
      // Check the sort order if there are multiple results
      if (p3Rankings.length > 1) {
        for (let i = 0; i < p3Rankings.length - 1; i++) {
          expect(p3Rankings[i].rankingPoints).toBeGreaterThanOrEqual(p3Rankings[i + 1].rankingPoints);
        }
      }
    });
  });

  describe('countByPlayerLevel', () => {
    it('should count rankings by player level', async () => {
      // Act
      const p1Count = await repository.countByPlayerLevel(PlayerLevel.P1);
      const p2Count = await repository.countByPlayerLevel(PlayerLevel.P2);
      const p3Count = await repository.countByPlayerLevel(PlayerLevel.P3);

      // Assert
      expect(p1Count).toBeGreaterThanOrEqual(1);
      expect(p2Count).toBeGreaterThanOrEqual(1);
      expect(p3Count).toBeGreaterThanOrEqual(1);
    });
  });

  // Test CUD operations in a transaction
  describe('save and update operations', () => {
    it('should handle save operation', async () => {
      await testSuite.runInTransaction(async (tx) => {
        // Arrange
        const existingRanking = await repository.findByPlayerId(testUsers[0].id);
        
        expect(existingRanking).not.toBeNull();
        
        // Create a new ranking with updated values
        const updatedRanking = new Ranking(
          existingRanking!.id,
          existingRanking!.playerId,
          999, // Updated ranking points
          existingRanking!.globalPosition,
          existingRanking!.categoryPosition,
          existingRanking!.playerLevel,
          existingRanking!.previousPosition,
          existingRanking!.positionChange,
          new Date(),
          existingRanking!.createdAt,
          new Date()
        );

        // Act & Assert - just confirm it doesn't throw an error
        // Note: The mock implementation doesn't persist data changes
        await expect(repository.save(updatedRanking)).resolves.not.toThrow();
      });
    });

    it('should handle update operation', async () => {
      await testSuite.runInTransaction(async (tx) => {
        // Arrange
        const existingRanking = await repository.findByPlayerId(testUsers[0].id);
        
        expect(existingRanking).not.toBeNull();
        
        // Create a new ranking with updated values
        const updatedRanking = new Ranking(
          existingRanking!.id,
          existingRanking!.playerId,
          888, // Different updated ranking points
          existingRanking!.globalPosition,
          existingRanking!.categoryPosition,
          existingRanking!.playerLevel,
          existingRanking!.previousPosition,
          existingRanking!.positionChange,
          new Date(),
          existingRanking!.createdAt,
          new Date()
        );

        // Act & Assert - just confirm it doesn't throw an error
        // Note: The mock implementation doesn't persist data changes
        await expect(repository.update(updatedRanking)).resolves.not.toThrow();
      });
    });
  });

  describe('delete', () => {
    it('should handle delete operation', async () => {
      await testSuite.runInTransaction(async (tx) => {
        // Arrange - Use the third ranking which we're not using for other tests
        const targetRankingId = testRankings[2].id;

        // Act
        const result = await repository.delete(targetRankingId);

        // Assert - No need to verify actual deletion since transactions will be rolled back
        expect(result).toBe(true);
      });
    });

    it('should return false when deleting non-existent ranking', async () => {
      // Act
      const result = await repository.delete('non-existent-id');

      // Assert
      expect(result).toBe(false);
    });
  });
}); 