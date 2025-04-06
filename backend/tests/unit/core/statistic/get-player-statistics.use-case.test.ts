import {
  GetPlayerStatisticsUseCase,
  GetPlayerStatisticsInput,
} from '../../../../src/core/application/use-cases/statistic/get-player-statistics.use-case';
import { IStatisticRepository } from '../../../../src/core/application/interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Statistic } from '../../../../src/core/domain/statistic/statistic.entity';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock repositories
class MockStatisticRepository implements IStatisticRepository {
  private statistics: Statistic[] = [];

  constructor(initialStatistics: Statistic[] = []) {
    this.statistics = initialStatistics;
  }

  async findById(id: string): Promise<Statistic | null> {
    return this.statistics.find(s => s.id === id) || null;
  }

  async findByPlayerId(playerId: string): Promise<Statistic | null> {
    return this.statistics.find(s => s.playerId === playerId) || null;
  }

  async findAll(): Promise<Statistic[]> {
    return this.statistics;
  }

  async count(): Promise<number> {
    return this.statistics.length;
  }

  async save(statistic: Statistic): Promise<void> {
    this.statistics.push(statistic);
  }

  async update(statistic: Statistic): Promise<void> {
    const index = this.statistics.findIndex(s => s.id === statistic.id);
    if (index !== -1) {
      this.statistics[index] = statistic;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.statistics.findIndex(s => s.id === id);
    if (index !== -1) {
      this.statistics.splice(index, 1);
    }
  }

  async findByTournamentId(tournamentId: string): Promise<Statistic[]> {
    return [];
  }
}

class MockPlayerRepository implements IPlayerRepository {
  private players: Player[] = [];

  constructor(initialPlayers: Player[] = []) {
    this.players = initialPlayers;
  }

  async findById(id: string): Promise<Player | null> {
    return this.players.find(p => p.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    return this.players.find(p => p.userId === userId) || null;
  }

  async findAll(): Promise<Player[]> {
    return this.players;
  }

  async count(): Promise<number> {
    return this.players.length;
  }

  async findByLevel(level: PlayerLevel): Promise<Player[]> {
    return this.players.filter(p => p.level === level);
  }

  async save(player: Player): Promise<void> {
    this.players.push(player);
  }

  async update(player: Player): Promise<void> {
    const index = this.players.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.players[index] = player;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.players.findIndex(p => p.id === id);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }
}

describe('GetPlayerStatisticsUseCase', () => {
  // Repository mocks
  let statisticRepository: IStatisticRepository;
  let playerRepository: IPlayerRepository;

  // Use case
  let useCase: GetPlayerStatisticsUseCase;

  // Test data
  const playerId = '123e4567-e89b-12d3-a456-426614174000';
  const userId = '123e4567-e89b-12d3-a456-426614174001';

  const testPlayer = new Player(playerId, userId, PlayerLevel.P3, 30, 'Spain');

  const testStatistic = new Statistic(
    'stat-1',
    playerId,
    10, // matchesPlayed
    7, // matchesWon
    3, // matchesLost
    120, // totalPoints
    12, // averageScore
    3, // tournamentsPlayed
    1, // tournamentsWon
    70, // winRate
  );

  beforeEach(() => {
    // Initialize repositories
    statisticRepository = new MockStatisticRepository([testStatistic]);
    playerRepository = new MockPlayerRepository([testPlayer]);

    // Initialize use case
    useCase = new GetPlayerStatisticsUseCase(statisticRepository, playerRepository);
  });

  it('should get player statistics successfully', async () => {
    // Arrange
    const input: GetPlayerStatisticsInput = { playerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const statistic = result.getValue().statistic;
    expect(statistic.id).toBe(testStatistic.id);
    expect(statistic.playerId).toBe(playerId);
    expect(statistic.matchesPlayed).toBe(10);
    expect(statistic.matchesWon).toBe(7);
    expect(statistic.matchesLost).toBe(3);
    expect(statistic.totalPoints).toBe(120);
    expect(statistic.averageScore).toBe(12);
    expect(statistic.tournamentsPlayed).toBe(3);
    expect(statistic.tournamentsWon).toBe(1);
    expect(statistic.winRate).toBe(70);
  });

  it('should fail when statistics not found for player', async () => {
    // Arrange
    const otherPlayerId = '123e4567-e89b-12d3-a456-426614174002';
    const otherPlayer = new Player(otherPlayerId, 'other-user-id', PlayerLevel.P3, 25, 'USA');

    // Add the player but no statistics
    playerRepository = new MockPlayerRepository([testPlayer, otherPlayer]);
    useCase = new GetPlayerStatisticsUseCase(statisticRepository, playerRepository);

    const input: GetPlayerStatisticsInput = { playerId: otherPlayerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().statistic).toBeDefined();
  });

  it('should fail when player does not exist', async () => {
    // Arrange
    const nonExistentPlayerId = '123e4567-e89b-12d3-a456-426614174999';
    const input: GetPlayerStatisticsInput = { playerId: nonExistentPlayerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Player not found');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const invalidInput = { playerId: 'not-a-uuid' };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid player ID format');
  });

  it('should accept date range in input', async () => {
    // Arrange
    const input: GetPlayerStatisticsInput = {
      playerId,
      dateRange: {
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      },
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().statistic).toBeDefined();
  });
});
