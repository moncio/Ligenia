import { PrismaClient } from '@prisma/client';
import { Player } from '../../../src/core/domain/player/player.entity';
import { PlayerRepository } from '../../../src/infrastructure/database/prisma/repositories/player.repository';
import { v4 as uuidv4 } from 'uuid';
import { testData, cleanupData } from '../../utils/test-utils';
import { PlayerLevel } from '../../../src/core/domain/tournament/tournament.entity';

describe('PlayerRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: PlayerRepository;
  let testPlayers: Player[] = [];
  let testUserIds: string[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new PlayerRepository(prisma);
  });

  beforeEach(async () => {
    // Clean up any existing test data
    await cleanupData.cleanupAll(prisma);
    
    // Create fresh test users
    const users = await Promise.all([
      testData.createUser(prisma, { email: 'player-test-1@example.com' }),
      testData.createUser(prisma, { email: 'player-test-2@example.com' }),
      testData.createUser(prisma, { email: 'player-test-3@example.com' }),
    ]);
    
    testUserIds = users.map(user => user.id);
    
    // Create test players
    testPlayers = [
      new Player(
        uuidv4(),
        testUserIds[0],
        PlayerLevel.P1,
        25,
        'USA',
        'https://example.com/avatar1.jpg',
        new Date(),
        new Date(),
      ),
      new Player(
        uuidv4(),
        testUserIds[1],
        PlayerLevel.P2,
        30,
        'Spain',
        'https://example.com/avatar2.jpg',
        new Date(),
        new Date(),
      ),
      new Player(
        uuidv4(),
        testUserIds[2],
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
    await cleanupData.cleanupAll(prisma);
    await prisma.$disconnect();
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

    it('should return empty array for non-existent level', async () => {
      // Act
      // Using P3 level but ensuring no P3 players exist
      await prisma.player.deleteMany({
        where: { level: 'P3' }
      });
      
      const players = await repository.findByLevel(PlayerLevel.P3);

      // Assert
      expect(players).toHaveLength(0);
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      // Save test players before each test in this describe block
      await Promise.all(testPlayers.map(player => repository.save(player)));
    });

    it('should count all players without filter', async () => {
      // Act
      const count = await repository.count();

      // Assert
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it('should count players by level', async () => {
      // Act
      const count = await repository.count({ level: PlayerLevel.P1 });

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
