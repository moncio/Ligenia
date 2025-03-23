import {
  GetGlobalRankingListUseCase,
  GetGlobalRankingListInput,
} from '../../../../src/core/application/use-cases/ranking/get-global-ranking-list.use-case';
import { IRankingRepository } from '../../../../src/core/application/interfaces/repositories/ranking.repository';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Ranking } from '../../../../src/core/domain/ranking/ranking.entity';
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

describe('GetGlobalRankingListUseCase', () => {
  // Repository mocks
  let rankingRepository: IRankingRepository;
  let playerRepository: IPlayerRepository;

  // Use case
  let useCase: GetGlobalRankingListUseCase;

  // Test data - Players
  const player1Id = '123e4567-e89b-12d3-a456-426614174001';
  const player2Id = '123e4567-e89b-12d3-a456-426614174002';
  const player3Id = '123e4567-e89b-12d3-a456-426614174003';
  const player4Id = '123e4567-e89b-12d3-a456-426614174004';

  const player1 = new Player(player1Id, 'user1', PlayerLevel.P3, 30, 'Spain');
  const player2 = new Player(player2Id, 'user2', PlayerLevel.P3, 28, 'France');
  const player3 = new Player(player3Id, 'user3', PlayerLevel.P2, 25, 'Germany');
  const player4 = new Player(player4Id, 'user4', PlayerLevel.P1, 22, 'USA');

  // Test data - Rankings
  const ranking1 = new Ranking(
    'rank-1',
    player1Id,
    48.7, // rankingPoints
    2, // globalPosition
    1, // categoryPosition
    PlayerLevel.P3,
    3, // previousPosition
    1, // positionChange
    new Date(2023, 5, 1),
  );

  const ranking2 = new Ranking(
    'rank-2',
    player2Id,
    35.2, // rankingPoints
    3, // globalPosition
    2, // categoryPosition
    PlayerLevel.P3,
    4, // previousPosition
    1, // positionChange
    new Date(2023, 5, 1),
  );

  const ranking3 = new Ranking(
    'rank-3',
    player3Id,
    65.3, // rankingPoints
    1, // globalPosition
    1, // categoryPosition
    PlayerLevel.P2,
    1, // previousPosition
    0, // positionChange
    new Date(2023, 5, 1),
  );

  const ranking4 = new Ranking(
    'rank-4',
    player4Id,
    25.1, // rankingPoints
    4, // globalPosition
    1, // categoryPosition
    PlayerLevel.P1,
    2, // previousPosition
    -2, // positionChange (negative = worse position)
    new Date(2023, 5, 1),
  );

  beforeEach(() => {
    // Initialize repositories with test data
    rankingRepository = new MockRankingRepository([ranking1, ranking2, ranking3, ranking4]);
    playerRepository = new MockPlayerRepository([player1, player2, player3, player4]);

    // Initialize use case
    useCase = new GetGlobalRankingListUseCase(rankingRepository, playerRepository);
  });

  it('should get all rankings with default pagination', async () => {
    // Arrange
    const input: GetGlobalRankingListInput = {}; // Use defaults

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(4); // Default limit is 10, we have 4
    expect(output.pagination.total).toBe(4);
    expect(output.pagination.limit).toBe(10);
    expect(output.pagination.offset).toBe(0);
    expect(output.pagination.hasMore).toBe(false);

    // Check player details are included
    expect(output.rankings[0].player).toBeDefined();
    expect(output.rankings[0].player?.id).toBe(player3Id); // First in global ranking
  });

  it('should apply correct pagination with limit and offset', async () => {
    // Arrange
    const input: GetGlobalRankingListInput = {
      limit: 2,
      offset: 1,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(2);
    expect(output.pagination.total).toBe(4);
    expect(output.pagination.limit).toBe(2);
    expect(output.pagination.offset).toBe(1);
    expect(output.pagination.hasMore).toBe(true);

    // Should include player1 and player2 (2nd and 3rd positions)
    const playerIds = output.rankings.map(r => r.playerId);
    expect(playerIds).toContain(player1Id);
    expect(playerIds).toContain(player2Id);
  });

  it('should filter rankings by player level', async () => {
    // Arrange
    const input: GetGlobalRankingListInput = {
      playerLevel: PlayerLevel.P3,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(2); // Only P3 players
    expect(output.pagination.total).toBe(2);

    // All players should be P3
    output.rankings.forEach(ranking => {
      expect(ranking.playerLevel).toBe(PlayerLevel.P3);
    });
  });

  it('should sort rankings by ranking points in descending order', async () => {
    // Arrange
    const input: GetGlobalRankingListInput = {
      sortBy: 'rankingPoints',
      sortOrder: 'desc',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const output = result.getValue();
    const rankingPoints = output.rankings.map(r => r.rankingPoints);

    // Should be in descending order
    expect(rankingPoints).toEqual(rankingPoints.sort((a, b) => b - a));

    // First player should be the one with highest points
    expect(output.rankings[0].playerId).toBe(player3Id);
  });

  it('should sort rankings by global position in ascending order', async () => {
    // Arrange
    const input: GetGlobalRankingListInput = {
      sortBy: 'globalPosition',
      sortOrder: 'asc',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const output = result.getValue();
    const positions = output.rankings.map(r => r.globalPosition);

    // Should be in ascending order
    expect(positions).toEqual([1, 2, 3, 4]);

    // First player should be the one with position 1
    expect(output.rankings[0].playerId).toBe(player3Id);
  });

  it('should handle empty results correctly', async () => {
    // Arrange
    rankingRepository = new MockRankingRepository([]); // Empty rankings
    useCase = new GetGlobalRankingListUseCase(rankingRepository, playerRepository);

    const input: GetGlobalRankingListInput = {};

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(0);
    expect(output.pagination.total).toBe(0);
    expect(output.pagination.hasMore).toBe(false);
  });

  it('should handle invalid input gracefully', async () => {
    // Arrange
    const invalidInput = {
      limit: -1, // Invalid: must be positive
      offset: -5, // Invalid: must be non-negative
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
  });
});
