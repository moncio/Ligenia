import { PrismaClient } from '@prisma/client';
import { Match, MatchStatus } from '../../../src/core/domain/match/match.entity';
import { MatchRepository } from '../../../src/infrastructure/database/prisma/repositories/match.repository';
import { v4 as uuidv4 } from 'uuid';

describe('MatchRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: MatchRepository;
  let tournamentId: string;
  let testMatches: Match[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new MatchRepository(prisma);

    // Create a test tournament for the matches
    const tournament = await prisma.tournament.create({
      data: {
        id: uuidv4(),
        name: 'Test Tournament for Matches',
        description: 'Test description',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        registrationEndDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        location: 'Test Location',
        status: 'DRAFT', // Using correct Prisma enum for tournament status
        category: 'P3', // Using correct Prisma enum for category
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    tournamentId = tournament.id;

    // Create test players with User records
    const user1Id = uuidv4();
    const user2Id = uuidv4();
    const user3Id = uuidv4();
    const user4Id = uuidv4();

    // First create the users
    const user1 = await prisma.user.create({
      data: {
        id: user1Id,
        email: 'player1@test.com',
        password: 'password123',
        name: 'Player 1',
        role: 'PLAYER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const user2 = await prisma.user.create({
      data: {
        id: user2Id,
        email: 'player2@test.com',
        password: 'password123',
        name: 'Player 2',
        role: 'PLAYER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const user3 = await prisma.user.create({
      data: {
        id: user3Id,
        email: 'player3@test.com',
        password: 'password123',
        name: 'Player 3',
        role: 'PLAYER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const user4 = await prisma.user.create({
      data: {
        id: user4Id,
        email: 'player4@test.com',
        password: 'password123',
        name: 'Player 4',
        role: 'PLAYER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Then create the player profiles
    const player1 = await prisma.player.create({
      data: {
        id: uuidv4(),
        userId: user1Id,
        level: 'P1', // Using correct Prisma enum for player level
        age: 25,
        country: 'US',
        avatar_url: 'https://example.com/avatar1.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const player2 = await prisma.player.create({
      data: {
        id: uuidv4(),
        userId: user2Id,
        level: 'P2', // Using correct Prisma enum for player level
        age: 28,
        country: 'ES',
        avatar_url: 'https://example.com/avatar2.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const player3 = await prisma.player.create({
      data: {
        id: uuidv4(),
        userId: user3Id,
        level: 'P3', // Using correct Prisma enum for player level
        age: 30,
        country: 'FR',
        avatar_url: 'https://example.com/avatar3.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const player4 = await prisma.player.create({
      data: {
        id: uuidv4(),
        userId: user4Id,
        level: 'P3', // Using correct Prisma enum for player level
        age: 32,
        country: 'DE',
        avatar_url: 'https://example.com/avatar4.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create test matches
    testMatches = [
      new Match(
        uuidv4(),
        tournamentId,
        user1.id,
        user2.id,
        user3.id,
        user4.id,
        1,
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day from now
        'Court 1',
        MatchStatus.PENDING,
        0,
        0,
        new Date(),
        new Date(),
      ),
      new Match(
        uuidv4(),
        tournamentId,
        user1.id,
        user2.id,
        user3.id,
        user4.id,
        2,
        new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        'Court 2',
        MatchStatus.PENDING,
        0,
        0,
        new Date(),
        new Date(),
      ),
    ];
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.match.deleteMany({
      where: { tournamentId },
    });

    await prisma.tournament.delete({
      where: { id: tournamentId },
    });

    await prisma.player.deleteMany({});
    await prisma.user.deleteMany({});

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean matches before each test
    await prisma.match.deleteMany({
      where: { tournamentId },
    });
  });

  describe('save', () => {
    it('should save a new match', async () => {
      // Act
      const result = await repository.saveWithResult(testMatches[0]);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const savedMatch = result.getValue();
      expect(savedMatch.id).toBe(testMatches[0].id);
      expect(savedMatch.tournamentId).toBe(testMatches[0].tournamentId);
      expect(savedMatch.homePlayerOneId).toBe(testMatches[0].homePlayerOneId);
      expect(savedMatch.status).toBe(testMatches[0].status);
    });

    it('should update an existing match', async () => {
      // Arrange
      await repository.saveWithResult(testMatches[0]);

      const updatedMatch = new Match(
        testMatches[0].id,
        testMatches[0].tournamentId,
        testMatches[0].homePlayerOneId,
        testMatches[0].homePlayerTwoId,
        testMatches[0].awayPlayerOneId,
        testMatches[0].awayPlayerTwoId,
        testMatches[0].round,
        testMatches[0].date,
        'Updated Court',
        MatchStatus.IN_PROGRESS,
        2,
        1,
        testMatches[0].createdAt,
        new Date(),
      );

      // Act
      const result = await repository.saveWithResult(updatedMatch);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const savedMatch = result.getValue();
      expect(savedMatch.location).toBe('Updated Court');
      expect(savedMatch.status).toBe(MatchStatus.IN_PROGRESS);
      expect(savedMatch.homeScore).toBe(2);
      expect(savedMatch.awayScore).toBe(1);
    });
  });

  describe('findById', () => {
    it('should return a match by id', async () => {
      // Arrange
      const saveResult = await repository.saveWithResult(testMatches[0]);
      const savedMatch = saveResult.getValue();

      // Act
      const result = await repository.findById(savedMatch.id);

      // Assert
      expect(result).not.toBeNull();
      expect(result?.id).toBe(savedMatch.id);
    });

    it('should return null when match not found', async () => {
      // Act
      const result = await repository.findById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('find', () => {
    beforeEach(async () => {
      // Save only one test match to avoid conflicts
      await repository.saveWithResult(testMatches[0]);
    });

    it('should find matches by tournament id', async () => {
      // Arrange
      const tournamentId = testMatches[0].tournamentId;

      // Act
      const result = await repository.find({ tournamentId });

      // Assert
      expect(result.isSuccess()).toBe(true);
      const matches = result.getValue();
      expect(matches.length).toBe(1);
      expect(matches[0].tournamentId).toBe(tournamentId);
    });

    it('should find matches by player id', async () => {
      // Arrange
      const playerId = testMatches[0].homePlayerOneId;

      // Act
      const result = await repository.findByPlayerId(playerId);

      // Assert
      const matches = result;
      expect(matches.length).toBe(1);
      expect(matches[0].homePlayerOneId).toBe(testMatches[0].homePlayerOneId);
    });

    it('should find matches by status', async () => {
      // Act
      const result = await repository.find({ status: MatchStatus.PENDING });

      // Assert
      expect(result.isSuccess()).toBe(true);
      const matches = result.getValue();
      expect(matches.length).toBe(1);
      expect(matches[0].status).toBe(MatchStatus.PENDING);
    });

    it('should support pagination', async () => {
      // Act
      const filter = {};
      const result = await repository.find(filter, 0, 1);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const matches = result.getValue();
      expect(matches.length).toBe(1);
    });
  });

  describe('findByTournamentAndPlayerId', () => {
    beforeEach(async () => {
      // Save only one test match
      await repository.saveWithResult(testMatches[0]);
    });

    it('should find matches by tournament id and player id', async () => {
      // Arrange
      const tournamentId = testMatches[0].tournamentId;
      const playerId = testMatches[0].homePlayerOneId;

      // Act
      const result = await repository.findByTournamentAndPlayerId(tournamentId, playerId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const matches = result.getValue();
      expect(matches.length).toBe(1);
      expect(matches[0].tournamentId).toBe(tournamentId);
      expect(matches[0].homePlayerOneId).toBe(playerId);
    });
  });

  describe('delete', () => {
    it('should delete a match', async () => {
      // Arrange
      const saveResult = await repository.saveWithResult(testMatches[0]);
      const match = saveResult.getValue();

      // Act
      const deleteResult = await repository.delete(match.id);

      // Assert
      expect(deleteResult).toBe(true);

      const findResult = await repository.findById(match.id);
      expect(findResult).toBeNull();
    });
  });

  describe('count', () => {
    beforeEach(async () => {
      // Create a match for count tests
      await repository.saveWithResult(testMatches[0]);
    });

    it('should count all matches', async () => {
      // Act
      const result = await repository.countWithResult({});

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(1);
    });

    it('should count matches with filter', async () => {
      // Act
      const result = await repository.countWithResult({ status: MatchStatus.PENDING });

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(1);
    });
  });

  describe('tournamentHasMatches', () => {
    beforeEach(async () => {
      // Create a match for this test
      await repository.saveWithResult(testMatches[0]);
    });

    it('should return true when tournament has matches', async () => {
      // Arrange
      const tournamentId = testMatches[0].tournamentId;

      // Act
      const result = await repository.tournamentHasMatchesWithResult(tournamentId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(true);
    });

    it('should return false when tournament has no matches', async () => {
      // Arrange
      const tournamentId = 'non-existent-tournament-id';

      // Act
      const result = await repository.tournamentHasMatchesWithResult(tournamentId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toBe(false);
    });
  });
});
