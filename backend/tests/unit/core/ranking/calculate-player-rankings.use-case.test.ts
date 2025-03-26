import {
  CalculatePlayerRankingsUseCase,
  CalculatePlayerRankingsInput,
} from '../../../../src/core/application/use-cases/ranking/calculate-player-rankings.use-case';
import { IRankingRepository } from '../../../../src/core/application/interfaces/repositories/ranking.repository';
import { IStatisticRepository } from '../../../../src/core/application/interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Ranking } from '../../../../src/core/domain/ranking/ranking.entity';
import { Statistic } from '../../../../src/core/domain/statistic/statistic.entity';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock repositories
class MockRankingRepository implements IRankingRepository {
  private rankings: Ranking[] = [];

  constructor(initialRankings: Ranking[] = []) {
    this.rankings = initialRankings;
  }

  async findById(id: string): Promise<Ranking | null> {
    return this.rankings.find(r => r.id === id) || null;
  }

  async findByPlayerId(playerId: string): Promise<Ranking | null> {
    return this.rankings.find(r => r.playerId === playerId) || null;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    playerLevel?: PlayerLevel;
    sortBy?: 'rankingPoints' | 'globalPosition';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Ranking[]> {
    let result = [...this.rankings];

    if (options?.playerLevel) {
      result = result.filter(r => r.playerLevel === options.playerLevel);
    }

    if (options?.sortBy === 'rankingPoints') {
      result.sort((a, b) => {
        return options.sortOrder === 'asc'
          ? a.rankingPoints - b.rankingPoints
          : b.rankingPoints - a.rankingPoints;
      });
    } else if (options?.sortBy === 'globalPosition') {
      result.sort((a, b) => {
        return options.sortOrder === 'asc'
          ? a.globalPosition - b.globalPosition
          : b.globalPosition - a.globalPosition;
      });
    }

    if (options?.offset !== undefined && options?.limit !== undefined) {
      result = result.slice(options.offset, options.offset + options.limit);
    }

    return result;
  }

  async count(options?: { playerLevel?: PlayerLevel }): Promise<number> {
    if (options?.playerLevel) {
      return this.rankings.filter(r => r.playerLevel === options.playerLevel).length;
    }
    return this.rankings.length;
  }

  async save(ranking: Ranking): Promise<void> {
    this.rankings.push(ranking);
  }

  async update(ranking: Ranking): Promise<void> {
    const index = this.rankings.findIndex(r => r.id === ranking.id);
    if (index !== -1) {
      this.rankings[index] = ranking;
    }
  }

  async delete(id: string): Promise<boolean> {
    const index = this.rankings.findIndex(r => r.id === id);
    if (index !== -1) {
      this.rankings.splice(index, 1);
      return true;
    }
    return false;
  }

  async findByPlayerLevel(
    playerLevel: PlayerLevel,
    options?: {
      limit?: number;
      offset?: number;
      sortBy?: 'rankingPoints' | 'categoryPosition';
      sortOrder?: 'asc' | 'desc';
    },
  ): Promise<Ranking[]> {
    let result = this.rankings.filter(r => r.playerLevel === playerLevel);

    if (options?.sortBy === 'rankingPoints') {
      result.sort((a, b) => {
        return options.sortOrder === 'asc'
          ? a.rankingPoints - b.rankingPoints
          : b.rankingPoints - a.rankingPoints;
      });
    } else if (options?.sortBy === 'categoryPosition') {
      result.sort((a, b) => {
        return options.sortOrder === 'asc'
          ? a.categoryPosition - b.categoryPosition
          : b.categoryPosition - a.categoryPosition;
      });
    }

    if (options?.offset !== undefined && options?.limit !== undefined) {
      result = result.slice(options.offset, options.offset + options.limit);
    }

    return result;
  }

  async countByPlayerLevel(playerLevel: PlayerLevel): Promise<number> {
    return this.rankings.filter(r => r.playerLevel === playerLevel).length;
  }
}

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
    return this.statistics;
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

  async findAll(options?: any): Promise<Player[]> {
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

describe('CalculatePlayerRankingsUseCase', () => {
  // Repository mocks
  let rankingRepository: IRankingRepository;
  let statisticRepository: IStatisticRepository;
  let playerRepository: IPlayerRepository;

  // Use case
  let useCase: CalculatePlayerRankingsUseCase;

  // Test data - Players
  const player1Id = '123e4567-e89b-12d3-a456-426614174001';
  const player2Id = '123e4567-e89b-12d3-a456-426614174002';
  const player3Id = '123e4567-e89b-12d3-a456-426614174003';

  const player1 = new Player(player1Id, 'user1', PlayerLevel.P3, 30, 'Spain');
  const player2 = new Player(player2Id, 'user2', PlayerLevel.P3, 28, 'France');
  const player3 = new Player(player3Id, 'user3', PlayerLevel.P2, 25, 'Germany');

  // Test data - Statistics
  const statistic1 = new Statistic(
    'stat-1',
    player1Id,
    10, // matchesPlayed
    7, // matchesWon
    3, // matchesLost
    120, // totalPoints
    12, // averageScore
    3, // tournamentsPlayed
    1, // tournamentsWon
    70, // winRate
  );

  const statistic2 = new Statistic(
    'stat-2',
    player2Id,
    8, // matchesPlayed
    4, // matchesWon
    4, // matchesLost
    80, // totalPoints
    10, // averageScore
    2, // tournamentsPlayed
    0, // tournamentsWon
    50, // winRate
  );

  const statistic3 = new Statistic(
    'stat-3',
    player3Id,
    12, // matchesPlayed
    9, // matchesWon
    3, // matchesLost
    150, // totalPoints
    12.5, // averageScore
    4, // tournamentsPlayed
    2, // tournamentsWon
    75, // winRate
  );

  // Test data - Rankings
  const ranking1 = new Ranking(
    'rank-1',
    player1Id,
    0, // rankingPoints (will be calculated)
    0, // globalPosition (will be calculated)
    0, // categoryPosition (will be calculated)
    PlayerLevel.P3,
    null, // previousPosition
    0, // positionChange
    new Date(),
  );

  beforeEach(() => {
    // Initialize repositories with test data
    rankingRepository = new MockRankingRepository([ranking1]);
    statisticRepository = new MockStatisticRepository([statistic1, statistic2, statistic3]);
    playerRepository = new MockPlayerRepository([player1, player2, player3]);

    // Initialize use case
    useCase = new CalculatePlayerRankingsUseCase(
      rankingRepository,
      statisticRepository,
      playerRepository,
    );
  });

  it('should calculate ranking for a specific player correctly', async () => {
    // Arrange
    const input: CalculatePlayerRankingsInput = { playerId: player1Id };

    // Expected ranking points calculation
    // (winRate * 0.4) + (averageScore * 0.3) + (tournamentsWon * 15) + (matchesWon * 0.3)
    // (70 * 0.4) + (12 * 0.3) + (1 * 15) + (7 * 0.3) = 28 + 3.6 + 15 + 2.1 = 48.7
    const expectedRankingPoints = 28 + 3.6 + 15 + 2.1;

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().updatedRankings.length).toBe(1);

    const updatedRanking = result.getValue().updatedRankings[0];
    expect(updatedRanking.playerId).toBe(player1Id);
    expect(updatedRanking.rankingPoints).toBeCloseTo(expectedRankingPoints, 1);
    expect(updatedRanking.globalPosition).toBe(2); // Should be 2nd after player3
    expect(updatedRanking.categoryPosition).toBe(1); // Should be 1st in P3 category
    expect(updatedRanking.playerLevel).toBe(PlayerLevel.P3);
  });

  it('should calculate rankings for all players when no playerId is provided', async () => {
    // Arrange
    const input: CalculatePlayerRankingsInput = {};

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().updatedRankings.length).toBe(3); // All players should have rankings

    // Get the ranking for player3 who should be #1 globally
    const player3Ranking = result.getValue().updatedRankings.find(r => r.playerId === player3Id);
    expect(player3Ranking).toBeDefined();
    expect(player3Ranking?.globalPosition).toBe(1);
    expect(player3Ranking?.categoryPosition).toBe(1); // Should be 1st in P2 category

    // Check player1 and player2 rankings in P3 category
    const player1Ranking = result.getValue().updatedRankings.find(r => r.playerId === player1Id);
    const player2Ranking = result.getValue().updatedRankings.find(r => r.playerId === player2Id);

    expect(player1Ranking?.globalPosition).toBe(2);
    expect(player1Ranking?.categoryPosition).toBe(1); // 1st in P3

    expect(player2Ranking?.globalPosition).toBe(3);
    expect(player2Ranking?.categoryPosition).toBe(2); // 2nd in P3
  });

  it('should create a new ranking if one does not exist', async () => {
    // Arrange
    rankingRepository = new MockRankingRepository([]); // Empty rankings
    useCase = new CalculatePlayerRankingsUseCase(
      rankingRepository,
      statisticRepository,
      playerRepository,
    );

    const input: CalculatePlayerRankingsInput = { playerId: player1Id };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().updatedRankings.length).toBe(1);

    // Ranking should be newly created with proper ID
    const updatedRanking = result.getValue().updatedRankings[0];
    expect(updatedRanking.id).toBeDefined();
    expect(updatedRanking.id.length).toBeGreaterThan(0);
  });

  it('should fail when player not found', async () => {
    // Arrange
    const nonExistentPlayerId = '123e4567-e89b-12d3-a456-426614174999';
    const input: CalculatePlayerRankingsInput = { playerId: nonExistentPlayerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Player not found');
  });

  it('should fail when statistics not found for player', async () => {
    // Arrange
    const playerWithoutStatsId = '123e4567-e89b-12d3-a456-426614174004';
    const playerWithoutStats = new Player(playerWithoutStatsId, 'user4', PlayerLevel.P1, 22, 'USA');

    // Add player but not statistics
    playerRepository = new MockPlayerRepository([player1, player2, player3, playerWithoutStats]);
    useCase = new CalculatePlayerRankingsUseCase(
      rankingRepository,
      statisticRepository,
      playerRepository,
    );

    const input: CalculatePlayerRankingsInput = { playerId: playerWithoutStatsId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Statistics not found for this player');
  });

  it('should fail with invalid player ID format', async () => {
    // Arrange
    const invalidInput = { playerId: 'not-a-uuid' };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid player ID format');
  });

  it('should update position change when recalculating existing ranking', async () => {
    // Arrange
    // Set initial position to 3, so we can track change
    const initialRanking = new Ranking(
      'rank-1',
      player1Id,
      40, // rankingPoints
      3, // globalPosition
      2, // categoryPosition
      PlayerLevel.P3,
      null, // previousPosition
      0, // positionChange
      new Date(),
    );

    rankingRepository = new MockRankingRepository([initialRanking]);
    useCase = new CalculatePlayerRankingsUseCase(
      rankingRepository,
      statisticRepository,
      playerRepository,
    );

    const input: CalculatePlayerRankingsInput = { playerId: player1Id };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    const updatedRanking = result.getValue().updatedRankings[0];

    // Player1 should move from position 3 to position 2
    expect(updatedRanking.globalPosition).toBe(2);
    expect(updatedRanking.previousPosition).toBe(3);
    expect(updatedRanking.positionChange).toBe(1); // Positive change (improved position)
  });
});
