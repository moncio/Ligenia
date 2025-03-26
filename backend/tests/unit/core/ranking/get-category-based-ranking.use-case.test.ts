import {
  GetCategoryBasedRankingUseCase,
  GetCategoryBasedRankingInput,
} from '../../../../src/core/application/use-cases/ranking/get-category-based-ranking.use-case';
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

describe('GetCategoryBasedRankingUseCase', () => {
  // Repository mocks
  let rankingRepository: IRankingRepository;
  let playerRepository: IPlayerRepository;

  // Use case
  let useCase: GetCategoryBasedRankingUseCase;

  // Test data - Players
  const p3Player1Id = '123e4567-e89b-12d3-a456-426614174001';
  const p3Player2Id = '123e4567-e89b-12d3-a456-426614174002';
  const p2Player1Id = '123e4567-e89b-12d3-a456-426614174003';
  const p2Player2Id = '123e4567-e89b-12d3-a456-426614174004';
  const p1Player1Id = '123e4567-e89b-12d3-a456-426614174005';

  const p3Player1 = new Player(p3Player1Id, 'user1', PlayerLevel.P3, 30, 'Spain');
  const p3Player2 = new Player(p3Player2Id, 'user2', PlayerLevel.P3, 28, 'France');
  const p2Player1 = new Player(p2Player1Id, 'user3', PlayerLevel.P2, 25, 'Germany');
  const p2Player2 = new Player(p2Player2Id, 'user4', PlayerLevel.P2, 22, 'Italy');
  const p1Player1 = new Player(p1Player1Id, 'user5', PlayerLevel.P1, 35, 'USA');

  // Test data - Rankings
  const p3Ranking1 = new Ranking(
    'rank-1',
    p3Player1Id,
    48.7, // rankingPoints
    2, // globalPosition
    1, // categoryPosition
    PlayerLevel.P3,
    3, // previousPosition
    1, // positionChange
    new Date(2023, 5, 1),
  );

  const p3Ranking2 = new Ranking(
    'rank-2',
    p3Player2Id,
    35.2, // rankingPoints
    4, // globalPosition
    2, // categoryPosition
    PlayerLevel.P3,
    5, // previousPosition
    1, // positionChange
    new Date(2023, 5, 1),
  );

  const p2Ranking1 = new Ranking(
    'rank-3',
    p2Player1Id,
    65.3, // rankingPoints
    1, // globalPosition
    1, // categoryPosition
    PlayerLevel.P2,
    1, // previousPosition
    0, // positionChange
    new Date(2023, 5, 1),
  );

  const p2Ranking2 = new Ranking(
    'rank-4',
    p2Player2Id,
    40.1, // rankingPoints
    3, // globalPosition
    2, // categoryPosition
    PlayerLevel.P2,
    2, // previousPosition
    -1, // positionChange
    new Date(2023, 5, 1),
  );

  const p1Ranking1 = new Ranking(
    'rank-5',
    p1Player1Id,
    25.6, // rankingPoints
    5, // globalPosition
    1, // categoryPosition
    PlayerLevel.P1,
    4, // previousPosition
    -1, // positionChange
    new Date(2023, 5, 1),
  );

  beforeEach(() => {
    // Initialize repositories with test data
    const rankings = [
      new Ranking('ranking1', p3Player1Id, 100, 1, 1, PlayerLevel.P3.toString()),
      new Ranking('ranking2', p3Player2Id, 48.7, 2, 2, PlayerLevel.P3.toString()),
      new Ranking('ranking3', p2Player1Id, 1000, 1, 1, PlayerLevel.P2.toString()),
      new Ranking('ranking4', p2Player2Id, 900, 2, 2, PlayerLevel.P2.toString()),
    ];

    const players = [
      new Player(p3Player1Id, 'user1', PlayerLevel.P3, 30, 'Spain', 'player1.jpg'),
      new Player(p3Player2Id, 'user2', PlayerLevel.P3, 28, 'France', 'player2.jpg'),
      new Player(p2Player1Id, 'user3', PlayerLevel.P2, 25, 'Germany', 'player3.jpg'),
      new Player(p2Player2Id, 'user4', PlayerLevel.P2, 22, 'Italy', 'player4.jpg'),
    ];

    rankingRepository = new MockRankingRepository(rankings);
    playerRepository = new MockPlayerRepository(players);

    // Initialize use case
    useCase = new GetCategoryBasedRankingUseCase(rankingRepository, playerRepository);
  });

  it('should get P3 category rankings correctly', async () => {
    // Arrange
    const input: GetCategoryBasedRankingInput = {
      playerLevel: PlayerLevel.P3,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(2); // Two P3 players
    expect(output.pagination.total).toBe(2);
    expect(output.pagination.hasMore).toBe(false);
    expect(output.playerLevel).toBe(PlayerLevel.P3);

    // All rankings should be P3
    output.rankings.forEach(ranking => {
      expect(ranking.playerLevel).toBe(PlayerLevel.P3);
    });

    // First should be the one with category position 1
    expect(output.rankings[0].categoryPosition).toBe(1);
    expect(output.rankings[0].playerId).toBe(p3Player1Id);

    // Players should be attached
    expect(output.rankings[0].player).toBeDefined();
    expect(output.rankings[0].player?.id).toBe(p3Player1Id);
  });

  it('should get P2 category rankings correctly with pagination', async () => {
    // Arrange
    const input: GetCategoryBasedRankingInput = {
      playerLevel: PlayerLevel.P2,
      limit: 1,
      offset: 0,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(1); // Only one due to limit
    expect(output.pagination.total).toBe(2); // But there are 2 total
    expect(output.pagination.hasMore).toBe(true);
    expect(output.playerLevel).toBe(PlayerLevel.P2);

    // Should be the first ranked P2 player
    expect(output.rankings[0].playerId).toBe(p2Player1Id);

    // Try getting the second page
    const page2Input: GetCategoryBasedRankingInput = {
      playerLevel: PlayerLevel.P2,
      limit: 1,
      offset: 1,
    };

    const page2Result = await useCase.execute(page2Input);
    expect(page2Result.isSuccess()).toBe(true);

    const page2Output = page2Result.getValue();
    expect(page2Output.rankings.length).toBe(1);
    expect(page2Output.rankings[0].playerId).toBe(p2Player2Id);
    expect(page2Output.pagination.hasMore).toBe(false); // No more after this
  });

  it('should sort by ranking points in descending order', async () => {
    // Arrange
    const input: GetCategoryBasedRankingInput = {
      playerLevel: PlayerLevel.P3,
      sortBy: 'rankingPoints',
      sortOrder: 'desc',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(2);

    // Should be sorted by ranking points (highest first)
    expect(output.rankings[0].rankingPoints).toBeGreaterThan(output.rankings[1].rankingPoints);
    expect(output.rankings[0].playerId).toBe(p3Player1Id); // Higher points
    expect(output.rankings[1].playerId).toBe(p3Player2Id); // Lower points
  });

  it('should sort by category position in ascending order', async () => {
    // Arrange
    const input: GetCategoryBasedRankingInput = {
      playerLevel: PlayerLevel.P3,
      sortBy: 'categoryPosition',
      sortOrder: 'asc',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(2);

    // Should be sorted by category position (lowest first)
    expect(output.rankings[0].categoryPosition).toBeLessThan(output.rankings[1].categoryPosition);
    expect(output.rankings[0].playerId).toBe(p3Player1Id); // Position 1
    expect(output.rankings[1].playerId).toBe(p3Player2Id); // Position 2
  });

  it('should return empty array for a category with no rankings', async () => {
    // Arrange
    // Create repository with no P3 rankings
    const rankings = [
      new Ranking('ranking1', p2Player1Id, 1000, 1, 1, PlayerLevel.P2.toString()),
      new Ranking('ranking2', p2Player2Id, 900, 2, 2, PlayerLevel.P2.toString()),
      new Ranking('ranking3', p1Player1Id, 800, 3, 1, PlayerLevel.P1.toString()),
    ];

    const players = [
      new Player(p2Player1Id, 'user3', PlayerLevel.P2, 25, 'Germany', 'player3.jpg'),
      new Player(p2Player2Id, 'user4', PlayerLevel.P2, 22, 'Italy', 'player4.jpg'),
      new Player(p1Player1Id, 'user5', PlayerLevel.P1, 35, 'USA', 'player5.jpg'),
    ];

    rankingRepository = new MockRankingRepository(rankings);
    playerRepository = new MockPlayerRepository(players);

    useCase = new GetCategoryBasedRankingUseCase(rankingRepository, playerRepository);

    const input: GetCategoryBasedRankingInput = {
      playerLevel: PlayerLevel.P3, // No players in this level
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.rankings.length).toBe(0);
    expect(output.pagination.total).toBe(0);
    expect(output.pagination.hasMore).toBe(false);
  });

  it('should fail with invalid player level', async () => {
    // Arrange
    const invalidInput = {
      playerLevel: 'INVALID_LEVEL', // Not a valid enum value
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid player level');
  });

  it('should fail with invalid pagination parameters', async () => {
    // Arrange
    const invalidInput = {
      playerLevel: PlayerLevel.P3,
      limit: -5, // Invalid: must be positive
      offset: -1, // Invalid: must be non-negative
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure()).toBe(true);
  });
});
