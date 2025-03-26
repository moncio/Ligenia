import { TournamentRepository } from '../../../src/infrastructure/database/prisma/repositories/tournament.repository';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../src/core/domain/tournament/tournament.entity';

describe('TournamentRepository', () => {
  let repository: TournamentRepository;
  let prisma: PrismaClient;

  // Test data
  const testTournament = new Tournament(
    uuidv4(),
    'Test Tournament',
    'Test Description',
    new Date(Date.now() + 86400000), // tomorrow
    new Date(Date.now() + 172800000), // day after tomorrow
    TournamentFormat.SINGLE_ELIMINATION,
    TournamentStatus.DRAFT,
    'Test Location',
    16, // maxParticipants
    new Date(Date.now() + 43200000), // 12 hours from now (registration deadline)
    PlayerLevel.P3,
    'test-user-id',
    new Date(),
    new Date(),
  );

  // Setup
  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new TournamentRepository(prisma);
  });

  // Cleanup
  afterAll(async () => {
    // Cleanup test data
    await prisma.tournament.deleteMany({
      where: {
        name: { startsWith: 'Test' },
      },
    });

    await prisma.$disconnect();
  });

  it('should save a new tournament', async () => {
    // Act
    await repository.save(testTournament);

    // Assert - Verify by finding the tournament
    const savedTournament = await repository.findById(testTournament.id);
    expect(savedTournament).not.toBeNull();
    expect(savedTournament?.name).toBe(testTournament.name);
  });

  it('should find a tournament by id', async () => {
    // Act
    const foundTournament = await repository.findById(testTournament.id);

    // Assert
    expect(foundTournament).not.toBeNull();
    expect(foundTournament?.id).toBe(testTournament.id);
    expect(foundTournament?.name).toBe(testTournament.name);
  });

  it('should update a tournament', async () => {
    // Arrange
    const updatedName = 'Updated Test Tournament';
    testTournament.updateDetails(updatedName);

    // Act
    await repository.update(testTournament);

    // Assert - Verify by finding the tournament
    const updatedTournament = await repository.findById(testTournament.id);
    expect(updatedTournament?.name).toBe(updatedName);
  });

  it('should count tournaments', async () => {
    // Act
    const count = await repository.count();

    // Assert
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it('should delete a tournament', async () => {
    // Act
    await repository.delete(testTournament.id);

    // Assert - Verify by finding the tournament
    const deletedTournament = await repository.findById(testTournament.id);
    expect(deletedTournament).toBeNull();
  });

  // Test with filter and pagination
  it('should find tournaments with filter and pagination', async () => {
    // Arrange
    const newTournament1 = new Tournament(
      uuidv4(),
      'Test Tournament 1',
      'Filtered Test',
      new Date(),
      new Date(Date.now() + 86400000),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Test Location',
      null,
      new Date(Date.now() + 43200000), // 12 hours from now
      PlayerLevel.P2,
      'test-user-id',
    );

    const newTournament2 = new Tournament(
      uuidv4(),
      'Test Tournament 2',
      'Another Test',
      new Date(),
      new Date(Date.now() + 86400000),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Test Location',
      null,
      new Date(Date.now() + 43200000), // 12 hours from now
      PlayerLevel.P2,
      'test-user-id',
    );

    await repository.save(newTournament1);
    await repository.save(newTournament2);

    // Act
    const tournaments = await repository.findAll(
      {
        searchTerm: 'Test',
        category: PlayerLevel.P2,
      },
      {
        skip: 0,
        limit: 10,
        sort: { field: 'name', order: 'asc' },
      },
    );

    // Assert
    expect(tournaments.length).toBeGreaterThanOrEqual(2);
    expect(tournaments.some(t => t.name === 'Test Tournament 1')).toBe(true);
    expect(tournaments.some(t => t.name === 'Test Tournament 2')).toBe(true);

    // Cleanup
    await repository.delete(newTournament1.id);
    await repository.delete(newTournament2.id);
  });
});
