import {
  ListGlobalStatisticsUseCase,
  ListGlobalStatisticsInput,
} from '../../../../src/core/application/use-cases/statistic/list-global-statistics.use-case';
import { IStatisticRepository } from '../../../../src/core/application/interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Statistic } from '../../../../src/core/domain/statistic/statistic.entity';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';
import { PlayerFilter, PaginationOptions } from '../../../../src/core/domain/player/player.entity';

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
    return this.statistics;
  }
}

class MockPlayerRepository implements IPlayerRepository {
  private players: Player[] = [];

  constructor(initialPlayers: Player[] = []) {
    this.players = initialPlayers;
  }

  async findById(id: string): Promise<Player | null> {
    return this.players.find(player => player.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    return this.players.find(player => player.userId === userId) || null;
  }

  async findAll(filter?: PlayerFilter, pagination?: PaginationOptions): Promise<Player[]> {
    let players = [...this.players];

    if (filter) {
      if (filter.level) {
        players = players.filter(p => p.level === filter.level);
      }
      if (filter.userId) {
        players = players.filter(p => p.userId === filter.userId);
      }
    }

    if (pagination) {
      players = players.slice(
        pagination.skip || 0,
        (pagination.skip || 0) + (pagination.limit || players.length)
      );
    }

    return players;
  }

  async count(filter?: PlayerFilter): Promise<number> {
    let players = [...this.players];

    if (filter) {
      if (filter.level) {
        players = players.filter(p => p.level === filter.level);
      }
      if (filter.userId) {
        players = players.filter(p => p.userId === filter.userId);
      }
    }

    return players.length;
  }

  async findByLevel(level: PlayerLevel): Promise<Player[]> {
    return this.players.filter(player => player.level === level);
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

describe('ListGlobalStatisticsUseCase', () => {
  // Repository mocks
  let statisticRepository: IStatisticRepository;
  let playerRepository: IPlayerRepository;

  // Use case
  let useCase: ListGlobalStatisticsUseCase;

  // Test data
  const player1Id = '123e4567-e89b-12d3-a456-426614174001';
  const player2Id = '123e4567-e89b-12d3-a456-426614174002';
  const player3Id = '123e4567-e89b-12d3-a456-426614174003';
  const player4Id = '123e4567-e89b-12d3-a456-426614174004';

  // Players with different levels
  const players = [
    new Player(player1Id, 'user1', PlayerLevel.P3, 25, 'USA', 'player1.jpg'),
    new Player(player2Id, 'user2', PlayerLevel.P3, 28, 'Spain', 'player2.jpg'),
    new Player(player3Id, 'user3', PlayerLevel.P2, 30, 'France', 'player3.jpg'),
    new Player(player4Id, 'user4', PlayerLevel.P1, 22, 'Germany', 'player4.jpg'),
  ];

  // Statistics for each player
  const statistics = [
    new Statistic('stat1', player1Id, 10, 7, 3, 120, 12, 2, 1, 70),
    new Statistic('stat2', player2Id, 8, 5, 3, 80, 10, 2, 0, 62.5),
    new Statistic('stat3', player3Id, 12, 6, 6, 140, 11.6, 3, 1, 50),
    new Statistic('stat4', player4Id, 15, 10, 5, 200, 13.3, 4, 2, 66.7),
  ];

  beforeEach(() => {
    // Initialize repositories
    statisticRepository = new MockStatisticRepository(statistics);
    playerRepository = new MockPlayerRepository(players);

    // Initialize use case
    useCase = new ListGlobalStatisticsUseCase(statisticRepository, playerRepository);
  });

  it('should list global statistics for all players successfully', async () => {
    // Arrange
    const input: ListGlobalStatisticsInput = {};

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.statistics).toHaveLength(4);
    expect(output.summary).toBeDefined();

    // Check summary values
    expect(output.summary.topScorer?.playerId).toBe(player4Id);
    expect(output.summary.topScorer?.totalPoints).toBe(200);
    expect(output.summary.topScorer?.rank).toBe(1);

    expect(output.summary.highestWinRate?.playerId).toBe(player1Id);
    expect(output.summary.highestWinRate?.winRate).toBe(70);
    expect(output.summary.highestWinRate?.rank).toBeTruthy();

    expect(output.summary.mostMatchesPlayed?.playerId).toBe(player4Id);
    expect(output.summary.mostMatchesPlayed?.matchesPlayed).toBe(15);
    expect(output.summary.mostMatchesPlayed?.rank).toBeTruthy();

    expect(output.summary.totalPlayers).toBe(4);
    expect(output.summary.totalMatchesPlayed).toBe(45);

    // Calculate expected average win rate
    const expectedAvgWinRate = (70 + 62.5 + 50 + 66.7) / 4;
    expect(output.summary.averageWinRate).toBeCloseTo(expectedAvgWinRate, 1);

    // Check pagination
    expect(output.pagination).toEqual({
      total: 4,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('should filter statistics by player level', async () => {
    // Arrange
    const input: ListGlobalStatisticsInput = {
      playerLevel: PlayerLevel.P3
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.statistics).toHaveLength(2); // Only P3 players
    expect(output.statistics.every(stat => 
      players.find(p => p.id === stat.playerId)?.level === PlayerLevel.P3
    )).toBe(true);
  });

  it('should apply pagination and sorting correctly', async () => {
    // Arrange
    const input: ListGlobalStatisticsInput = {
      pagination: {
        page: 1,
        limit: 2,
        sortBy: 'matchesPlayed',
        sortOrder: 'desc',
      },
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.statistics).toHaveLength(2);

    // Check that sorting by matchesPlayed in descending order works
    expect(output.statistics[0].playerId).toBe(player4Id); // 15 matches
    expect(output.statistics[1].playerId).toBe(player3Id); // 12 matches

    // Verify rankings
    expect(output.statistics[0].rank).toBe(1);
    expect(output.statistics[1].rank).toBe(2);

    // Check summary is still based on all statistics
    expect(output.summary.totalPlayers).toBe(4);

    // Check pagination values
    expect(output.pagination.total).toBe(4);
    expect(output.pagination.page).toBe(1);
    expect(output.pagination.limit).toBe(2);
    expect(output.pagination.totalPages).toBe(2);
  });

  it('should handle the second page of results correctly', async () => {
    // Arrange
    const input: ListGlobalStatisticsInput = {
      pagination: {
        page: 2,
        limit: 2,
        sortBy: 'matchesPlayed',
        sortOrder: 'desc',
      },
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.statistics).toHaveLength(2);

    // Second page should have the players with fewer matches
    expect(output.statistics[0].playerId).toBe(player1Id); // 10 matches
    expect(output.statistics[1].playerId).toBe(player2Id); // 8 matches

    // Verify rankings are correct (3rd and 4th place)
    expect(output.statistics[0].rank).toBe(3);
    expect(output.statistics[1].rank).toBe(4);

    // Pagination values should reflect the second page
    expect(output.pagination.page).toBe(2);
    expect(output.pagination.totalPages).toBe(2);
  });

  it('should sort by win rate in ascending order correctly', async () => {
    // Arrange
    const input: ListGlobalStatisticsInput = {
      pagination: {
        sortBy: 'winRate',
        sortOrder: 'asc',
      },
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    // The statistics should be sorted by win rate in ascending order
    expect(output.statistics[0].playerId).toBe(player3Id); // 50% win rate
    expect(output.statistics[1].playerId).toBe(player2Id); // 62.5% win rate
    expect(output.statistics[2].playerId).toBe(player4Id); // 66.7% win rate
    expect(output.statistics[3].playerId).toBe(player1Id); // 70% win rate

    // Verify rankings match the sort order
    expect(output.statistics[0].rank).toBe(1);
    expect(output.statistics[1].rank).toBe(2);
    expect(output.statistics[2].rank).toBe(3);
    expect(output.statistics[3].rank).toBe(4);
  });

  it('should fail when no statistics are found', async () => {
    // Arrange
    statisticRepository = new MockStatisticRepository([]);
    useCase = new ListGlobalStatisticsUseCase(statisticRepository, playerRepository);

    const input: ListGlobalStatisticsInput = {};

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('No statistics found');
  });

  it('should fail when no players match the specified level', async () => {
    // Arrange
    const playersWithoutP1 = players.filter(p => p.level !== PlayerLevel.P1);
    const statisticsWithoutP1 = statistics.filter(s => s.playerId !== player4Id);
    statisticRepository = new MockStatisticRepository(statisticsWithoutP1);
    playerRepository = new MockPlayerRepository(playersWithoutP1);
    useCase = new ListGlobalStatisticsUseCase(statisticRepository, playerRepository);

    const input: ListGlobalStatisticsInput = {
      playerLevel: PlayerLevel.P1 // No players have this level after filtering
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('No statistics found for players with level P1');
  });

  it('should handle players with no matches correctly', async () => {
    // Arrange
    const player5Id = '123e4567-e89b-12d3-a456-426614174005';
    const player5 = new Player(player5Id, 'user5', PlayerLevel.P3, 35, 'Brazil', 'player5.jpg');
    const zeroMatchesStat = new Statistic('stat5', player5Id, 0, 0, 0, 0, 0, 0, 0, 0);

    statisticRepository = new MockStatisticRepository([...statistics, zeroMatchesStat]);
    playerRepository = new MockPlayerRepository([...players, player5]);
    useCase = new ListGlobalStatisticsUseCase(statisticRepository, playerRepository);

    const input: ListGlobalStatisticsInput = {};

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.statistics).toHaveLength(5);

    // Total matches played should exclude the player with zero matches
    expect(output.summary.totalMatchesPlayed).toBe(45); // Same as before

    // Average win rate should exclude players with zero matches
    const expectedAvgWinRate = (70 + 62.5 + 50 + 66.7) / 4; // Same as before
    expect(output.summary.averageWinRate).toBeCloseTo(expectedAvgWinRate, 1);
  });

  it('should handle non-existent player level', async () => {
    // Arrange
    const playersWithoutP1 = players.filter(p => p.level !== PlayerLevel.P1);
    const statisticsWithoutP1 = statistics.filter(s => s.playerId !== player4Id);
    statisticRepository = new MockStatisticRepository(statisticsWithoutP1);
    playerRepository = new MockPlayerRepository(playersWithoutP1);
    useCase = new ListGlobalStatisticsUseCase(statisticRepository, playerRepository);

    const input: ListGlobalStatisticsInput = {
      playerLevel: PlayerLevel.P1 // Using P1 which no players have after filtering
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('No statistics found for players with level P1');
  });
});
