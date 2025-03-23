import { PrismaClient } from '@prisma/client';
import { Player } from '../../../src/core/domain/player/player.entity';
import { PlayerRepository } from '../../../src/infrastructure/database/prisma/repositories/player.repository';
import { PlayerLevel } from '../../../src/core/domain/tournament/tournament.entity';
import { v4 as uuidv4 } from 'uuid';

describe('PlayerRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PlayerRepository;
  let testPlayers: Player[] = [];
  let testUsers: { id: string }[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PlayerRepository(prisma);

    // Create test users first
    testUsers = await Promise.all(
      Array(3).fill(0).map(async (_, i) => {
        const userId = uuidv4();
        await prisma.user.create({
          data: {
            id: userId,
            email: `test${i}@example.com`,
            password: 'password',
            name: `Test User ${i}`,
          },
        });
        return { id: userId };
      })
    );

    // Create test players
    testPlayers = [
      new Player(
        uuidv4(),
        testUsers[0].id, // userId
        PlayerLevel.P1,
        25,
        'USA',
        'https://example.com/avatar1.jpg',
        new Date(),
        new Date(),
      ),
      new Player(
        uuidv4(),
        testUsers[1].id, // userId
        PlayerLevel.P2,
        30,
        'Spain',
        'https://example.com/avatar2.jpg',
        new Date(),
        new Date(),
      ),
      new Player(
        uuidv4(),
        testUsers[2].id, // userId
        PlayerLevel.P3,
        35,
        'France',
        null,
        new Date(),
        new Date(),
      ),
    ];
  });

  afterAll(async () => {
    // Clean up test data
    for (const player of testPlayers) {
      try {
        await prisma.player.delete({
          where: { id: player.id },
        });
      } catch (error) {
        // Ignore errors if player doesn't exist
      }
    }

    // Clean up test users
    for (const user of testUsers) {
      try {
        await prisma.user.delete({
          where: { id: user.id },
        });
      } catch (error) {
        // Ignore errors if user doesn't exist
      }
    }

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean players before each test
    try {
      await prisma.player.deleteMany({
        where: { id: { in: testPlayers.map(p => p.id) } },
      });
    } catch (error) {
      // Ignore errors
    }
  });

  describe('save', () => {
    it('should save a new player', async () => {
      // Act
      await repository.save(testPlayers[0]);

      // Assert
      const savedPlayer = await prisma.player.findUnique({
        where: { id: testPlayers[0].id },
      });
      
      expect(savedPlayer).not.toBeNull();
      expect(savedPlayer?.id).toBe(testPlayers[0].id);
      expect(savedPlayer?.userId).toBe(testPlayers[0].userId);
      expect(savedPlayer?.level).toBe('P1');
      expect(savedPlayer?.country).toBe(testPlayers[0].country);
    });

    it('should update an existing player', async () => {
      // Arrange
      await repository.save(testPlayers[0]);

      const updatedPlayer = new Player(
        testPlayers[0].id,
        testPlayers[0].userId,
        PlayerLevel.P3,
        27,
        'Canada',
        'https://example.com/updated-avatar.jpg',
        testPlayers[0].createdAt,
        new Date(),
      );

      // Act
      await repository.update(updatedPlayer);

      // Assert
      const savedPlayer = await prisma.player.findUnique({
        where: { id: testPlayers[0].id },
      });
      
      expect(savedPlayer).not.toBeNull();
      expect(savedPlayer?.level).toBe('P3');
      expect(savedPlayer?.age).toBe(27);
      expect(savedPlayer?.country).toBe('Canada');
      expect(savedPlayer?.avatar_url).toBe('https://example.com/updated-avatar.jpg');
    });
  });

  describe('findById', () => {
    it('should return a player by id', async () => {
      // Arrange
      await repository.save(testPlayers[0]);

      // Act
      const player = await repository.findById(testPlayers[0].id);

      // Assert
      expect(player).not.toBeNull();
      expect(player?.id).toBe(testPlayers[0].id);
      expect(player?.userId).toBe(testPlayers[0].userId);
    });

    it('should return null when player not found', async () => {
      // Act
      const player = await repository.findById('non-existent-id');

      // Assert
      expect(player).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return a player by userId', async () => {
      // Arrange
      await repository.save(testPlayers[0]);

      // Act
      const player = await repository.findByUserId(testPlayers[0].userId);

      // Assert
      expect(player).not.toBeNull();
      expect(player?.id).toBe(testPlayers[0].id);
      expect(player?.userId).toBe(testPlayers[0].userId);
    });

    it('should return null when player not found by userId', async () => {
      // Act
      const player = await repository.findByUserId('non-existent-user-id');

      // Assert
      expect(player).toBeNull();
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      // Save test players before each test in this describe block
      await Promise.all(testPlayers.map(player => repository.save(player)));
    });

    it('should find all players without filter', async () => {
      // Act
      const players = await repository.findAll();

      // Assert
      expect(players.length).toBeGreaterThanOrEqual(3);
    });

    it('should find players by level', async () => {
      // Act
      const players = await repository.findAll({ level: PlayerLevel.P1 });

      // Assert
      expect(players.length).toBeGreaterThanOrEqual(1);
      expect(players[0].level).toBe(PlayerLevel.P1);
    });

    it('should find players by country', async () => {
      // Act
      const players = await repository.findAll({ country: 'Spain' });

      // Assert
      expect(players.length).toBeGreaterThanOrEqual(1);
      expect(players[0].country).toBe('Spain');
    });

    it('should support pagination', async () => {
      // Act
      const players = await repository.findAll(
        {},
        { skip: 0, limit: 2, sort: { field: 'createdAt', order: 'desc' } },
      );

      // Assert
      expect(players.length).toBeLessThanOrEqual(2);
    });
  });

  describe('findByLevel', () => {
    beforeEach(async () => {
      // Save test players before each test in this describe block
      await Promise.all(testPlayers.map(player => repository.save(player)));
    });

    it('should find players by level', async () => {
      // Act
      const players = await repository.findByLevel(PlayerLevel.P2);

      // Assert
      expect(players.length).toBeGreaterThanOrEqual(1);
      expect(players[0].level).toBe(PlayerLevel.P2);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      // Save test players before each test in this describe block
      await Promise.all(testPlayers.map(player => repository.save(player)));
    });

    it('should count all players', async () => {
      // Act
      const count = await repository.count();

      // Assert
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it('should count players with filter', async () => {
      // Act
      const count = await repository.count({ country: 'Spain' });

      // Assert
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('delete', () => {
    it('should delete a player', async () => {
      // Arrange
      await repository.save(testPlayers[0]);
      
      // Act
      await repository.delete(testPlayers[0].id);

      // Assert
      const deletedPlayer = await prisma.player.findUnique({
        where: { id: testPlayers[0].id },
      });
      
      expect(deletedPlayer).toBeNull();
    });
  });
});
