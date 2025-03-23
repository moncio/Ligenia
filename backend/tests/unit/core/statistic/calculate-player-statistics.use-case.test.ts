import {
  CalculatePlayerStatisticsUseCase,
  CalculatePlayerStatisticsInput,
} from '../../../../src/core/application/use-cases/statistic/calculate-player-statistics.use-case';
import { IStatisticRepository } from '../../../../src/core/application/interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { Statistic } from '../../../../src/core/domain/statistic/statistic.entity';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
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

class MockMatchRepository implements IMatchRepository {
  private matches: Match[] = [];

  constructor(initialMatches: Match[] = []) {
    this.matches = initialMatches;
  }

  async findById(id: string): Promise<Match | null> {
    return this.matches.find(m => m.id === id) || null;
  }

  async findByFilter(): Promise<Match[]> {
    return this.matches;
  }

  async findByTournamentAndRound(tournamentId: string, round: number): Promise<Match[]> {
    return this.matches.filter(m => m.tournamentId === tournamentId && m.round === round);
  }

  async findByPlayerId(playerId: string): Promise<Match[]> {
    return this.matches.filter(
      m =>
        m.homePlayerOneId === playerId ||
        m.homePlayerTwoId === playerId ||
        m.awayPlayerOneId === playerId ||
        m.awayPlayerTwoId === playerId,
    );
  }

  async save(match: Match): Promise<void> {
    this.matches.push(match);
  }

  async delete(id: string): Promise<boolean> {
    const index = this.matches.findIndex(m => m.id === id);
    if (index !== -1) {
      this.matches.splice(index, 1);
      return true;
    }
    return false;
  }

  async tournamentHasMatches(tournamentId: string): Promise<boolean> {
    return this.matches.some(m => m.tournamentId === tournamentId);
  }

  async count(): Promise<number> {
    return this.matches.length;
  }
}

describe('CalculatePlayerStatisticsUseCase', () => {
  // Repository mocks
  let statisticRepository: IStatisticRepository;
  let playerRepository: IPlayerRepository;
  let matchRepository: IMatchRepository;

  // Use case
  let useCase: CalculatePlayerStatisticsUseCase;

  // Test data
  const playerId = '123e4567-e89b-12d3-a456-426614174000';
  const userId = '123e4567-e89b-12d3-a456-426614174001';
  const tournamentId = '123e4567-e89b-12d3-a456-426614174002';

  const testPlayer = new Player(playerId, userId, PlayerLevel.P3, 30, 'Spain');

  // Create test matches
  const createTestMatch = (
    id: string,
    playerOnHomeTeam: boolean,
    homeScore: number,
    awayScore: number,
  ): Match => {
    return new Match(
      id,
      tournamentId,
      playerOnHomeTeam ? playerId : 'other-player-1',
      'other-player-2',
      playerOnHomeTeam ? 'other-player-3' : playerId,
      'other-player-4',
      1,
      new Date(),
      'Test Location',
      MatchStatus.COMPLETED,
      homeScore,
      awayScore,
    );
  };

  beforeEach(() => {
    // Initialize repositories
    statisticRepository = new MockStatisticRepository();
    playerRepository = new MockPlayerRepository([testPlayer]);
    matchRepository = new MockMatchRepository(); // Initialize with empty array

    // Initialize use case
    useCase = new CalculatePlayerStatisticsUseCase(
      statisticRepository,
      playerRepository,
      matchRepository,
    );
  });

  it('should calculate statistics for a player with no existing statistic', async () => {
    // Arrange
    const matches = [
      createTestMatch('match-1', true, 10, 5), // Player on home team, won
      createTestMatch('match-2', false, 3, 7), // Player on away team, won
      createTestMatch('match-3', true, 6, 8), // Player on home team, lost
    ];

    matchRepository = new MockMatchRepository(matches);
    useCase = new CalculatePlayerStatisticsUseCase(
      statisticRepository,
      playerRepository,
      matchRepository,
    );

    const input: CalculatePlayerStatisticsInput = { playerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const statistic = result.getValue().statistic;
    expect(statistic.playerId).toBe(playerId);
    expect(statistic.matchesPlayed).toBe(3);
    expect(statistic.matchesWon).toBe(2);
    expect(statistic.matchesLost).toBe(1);
    expect(statistic.totalPoints).toBe(23); // 10 + 7 + 6
    expect(statistic.winRate).toBe((2 / 3) * 100);
    expect(statistic.tournamentsPlayed).toBe(1);
  });

  it('should update existing statistics for a player', async () => {
    // Arrange
    const existingStatistic = new Statistic(
      'stat-1',
      playerId,
      3, // matchesPlayed
      2, // matchesWon
      1, // matchesLost
      20, // totalPoints
      6.67, // averageScore
      1, // tournamentsPlayed
      0, // tournamentsWon
      66.67, // winRate
    );

    statisticRepository = new MockStatisticRepository([existingStatistic]);

    const matches = [
      createTestMatch('match-1', true, 10, 5), // Player on home team, won
      createTestMatch('match-2', false, 5, 10), // Player on away team, won
    ];

    matchRepository = new MockMatchRepository(matches);
    useCase = new CalculatePlayerStatisticsUseCase(
      statisticRepository,
      playerRepository,
      matchRepository,
    );

    const input: CalculatePlayerStatisticsInput = { playerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const statistic = result.getValue().statistic;
    expect(statistic.id).toBe(existingStatistic.id);
    expect(statistic.matchesPlayed).toBe(2);
    expect(statistic.matchesWon).toBe(2);
    expect(statistic.matchesLost).toBe(0);
    expect(statistic.totalPoints).toBe(20); // 10 + 10
    expect(statistic.winRate).toBe(100);
    expect(statistic.tournamentsPlayed).toBe(1);
  });

  it('should handle player with no matches', async () => {
    // Arrange
    matchRepository = new MockMatchRepository([]);
    useCase = new CalculatePlayerStatisticsUseCase(
      statisticRepository,
      playerRepository,
      matchRepository,
    );

    const input: CalculatePlayerStatisticsInput = { playerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const statistic = result.getValue().statistic;
    expect(statistic.playerId).toBe(playerId);
    expect(statistic.matchesPlayed).toBe(0);
    expect(statistic.matchesWon).toBe(0);
    expect(statistic.matchesLost).toBe(0);
    expect(statistic.totalPoints).toBe(0);
    expect(statistic.winRate).toBe(0);
    expect(statistic.tournamentsPlayed).toBe(0);
    expect(statistic.tournamentsWon).toBe(0);
  });

  it('should skip matches where the player is not present', async () => {
    // Arrange
    const otherPlayerMatch = new Match(
      'match-1',
      tournamentId,
      'other-player-1',
      'other-player-2',
      'other-player-3',
      'other-player-4',
      1,
      new Date(),
      'Test Location',
      MatchStatus.COMPLETED,
      10,
      5,
    );

    matchRepository = new MockMatchRepository([otherPlayerMatch]);
    useCase = new CalculatePlayerStatisticsUseCase(
      statisticRepository,
      playerRepository,
      matchRepository,
    );

    const input: CalculatePlayerStatisticsInput = { playerId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const statistic = result.getValue().statistic;
    expect(statistic.matchesPlayed).toBe(0);
  });

  it('should fail when player does not exist', async () => {
    // Arrange
    const nonExistentPlayerId = '123e4567-e89b-12d3-a456-426614174999';
    const input: CalculatePlayerStatisticsInput = { playerId: nonExistentPlayerId };

    matchRepository = new MockMatchRepository([]);
    useCase = new CalculatePlayerStatisticsUseCase(
      statisticRepository,
      playerRepository,
      matchRepository,
    );

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Player not found');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const invalidInput = { playerId: 'not-a-uuid' };

    matchRepository = new MockMatchRepository([]);
    useCase = new CalculatePlayerStatisticsUseCase(
      statisticRepository,
      playerRepository,
      matchRepository,
    );

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid player ID format');
  });
});
