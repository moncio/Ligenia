import {
  GetTournamentStatisticsUseCase,
  GetTournamentStatisticsInput,
} from '../../../../src/core/application/use-cases/statistic/get-tournament-statistics.use-case';
import { IStatisticRepository } from '../../../../src/core/application/interfaces/repositories/statistic.repository';
import {
  ITournamentRepository,
  PaginationOptions,
} from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Statistic } from '../../../../src/core/domain/statistic/statistic.entity';
import {
  Tournament,
  TournamentStatus,
  PlayerLevel,
  TournamentFormat,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { Player } from '../../../../src/core/domain/player/player.entity';

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

class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Tournament[] = [];
  private participants: Map<string, string[]> = new Map();

  constructor(
    initialTournaments: Tournament[] = [],
    initialParticipants: { tournamentId: string; playerIds: string[] }[] = [],
  ) {
    this.tournaments = initialTournaments;

    // Initialize participants
    initialParticipants.forEach(p => {
      this.participants.set(p.tournamentId, p.playerIds);
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(t => t.id === id) || null;
  }

  async findAll(filter?: any, pagination?: PaginationOptions): Promise<Tournament[]> {
    return this.tournaments;
  }

  async getParticipants(tournamentId: string, pagination?: PaginationOptions): Promise<string[]> {
    return this.participants.get(tournamentId) || [];
  }

  async save(tournament: Tournament): Promise<void> {
    this.tournaments.push(tournament);
  }

  async update(tournament: Tournament): Promise<void> {
    const index = this.tournaments.findIndex(t => t.id === tournament.id);
    if (index !== -1) {
      this.tournaments[index] = tournament;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.tournaments.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tournaments.splice(index, 1);
    }
  }

  async count(): Promise<number> {
    return this.tournaments.length;
  }

  async countParticipants(tournamentId: string): Promise<number> {
    return this.participants.has(tournamentId) ? this.participants.get(tournamentId)!.length : 0;
  }

  async registerParticipant(tournamentId: string, playerId: string): Promise<void> {
    if (!this.participants.has(tournamentId)) {
      this.participants.set(tournamentId, []);
    }

    const participants = this.participants.get(tournamentId)!;
    if (!participants.includes(playerId)) {
      participants.push(playerId);
    }
  }

  async unregisterParticipant(tournamentId: string, playerId: string): Promise<void> {
    if (this.participants.has(tournamentId)) {
      const participants = this.participants.get(tournamentId)!;
      const index = participants.indexOf(playerId);
      if (index !== -1) {
        participants.splice(index, 1);
      }
    }
  }

  async isParticipantRegistered(tournamentId: string, playerId: string): Promise<boolean> {
    if (!this.participants.has(tournamentId)) {
      return false;
    }
    return this.participants.get(tournamentId)!.includes(playerId);
  }

  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    return this.participants.has(tournamentId) ? this.participants.get(tournamentId)!.length : 0;
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

describe('GetTournamentStatisticsUseCase', () => {
  // Repository mocks
  let statisticRepository: IStatisticRepository;
  let tournamentRepository: ITournamentRepository;
  let playerRepository: IPlayerRepository;

  // Use case
  let useCase: GetTournamentStatisticsUseCase;

  // Test data
  const tournamentId = '123e4567-e89b-12d3-a456-426614174000';
  const player1Id = '123e4567-e89b-12d3-a456-426614174001';
  const player2Id = '123e4567-e89b-12d3-a456-426614174002';
  const player3Id = '123e4567-e89b-12d3-a456-426614174003';

  const tournament = new Tournament(
    tournamentId,
    'Test Tournament',
    'Description',
    new Date(),
    null, // endDate
    TournamentFormat.SINGLE_ELIMINATION,
    TournamentStatus.ACTIVE,
    'Location',
    16, // maxParticipants
    null, // registrationDeadline
    PlayerLevel.P3,
    'creator-id', // createdById
    new Date(),
    new Date(),
  );

  const participants = [{ tournamentId, playerIds: [player1Id, player2Id, player3Id] }];

  const players = [
    new Player(player1Id, 'user1', PlayerLevel.P3, 25, 'USA', 'player1.jpg'),
    new Player(player2Id, 'user2', PlayerLevel.P3, 28, 'Spain', 'player2.jpg'),
    new Player(player3Id, 'user3', PlayerLevel.P3, 30, 'France', 'player3.jpg'),
  ];

  const statistics = [
    new Statistic('stat1', player1Id, 10, 7, 3, 120, 12, 2, 1, 70),
    new Statistic('stat2', player2Id, 8, 5, 3, 80, 10, 2, 0, 62.5),
    new Statistic('stat3', player3Id, 12, 6, 6, 140, 11.6, 3, 1, 50),
  ];

  beforeEach(() => {
    // Initialize repositories
    statisticRepository = new MockStatisticRepository(statistics);
    tournamentRepository = new MockTournamentRepository([tournament], participants);
    playerRepository = new MockPlayerRepository(players);

    // Initialize use case
    useCase = new GetTournamentStatisticsUseCase(
      statisticRepository,
      tournamentRepository,
      playerRepository,
    );
  });

  it('should get tournament statistics for all participants successfully', async () => {
    // Arrange
    const input: GetTournamentStatisticsInput = { tournamentId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.statistics).toHaveLength(3);
    expect(output.summary).toBeDefined();

    // Check summary values
    expect(output.summary.topScorer?.playerId).toBe(player3Id);
    expect(output.summary.topScorer?.totalPoints).toBe(140);
    expect(output.summary.topScorer?.playerName).toBe('player3.jpg');

    expect(output.summary.highestWinRate?.playerId).toBe(player1Id);
    expect(output.summary.highestWinRate?.winRate).toBe(70);
    expect(output.summary.highestWinRate?.playerName).toBe('player1.jpg');

    expect(output.summary.mostMatchesPlayed?.playerId).toBe(player3Id);
    expect(output.summary.mostMatchesPlayed?.matchesPlayed).toBe(12);
    expect(output.summary.mostMatchesPlayed?.playerName).toBe('player3.jpg');

    expect(output.summary.totalMatchesPlayed).toBe(30);
    expect(output.summary.averageWinRate).toBeCloseTo(60.83, 1);

    // Check pagination
    expect(output.pagination).toEqual({
      total: 3,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  });

  it('should apply pagination and sorting correctly', async () => {
    // Arrange
    const input: GetTournamentStatisticsInput = {
      tournamentId,
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
    expect(output.statistics[0].playerId).toBe(player3Id);
    expect(output.statistics[0].matchesPlayed).toBe(12);
    expect(output.statistics[1].playerId).toBe(player1Id);
    expect(output.statistics[1].matchesPlayed).toBe(10);

    // Check pagination values
    expect(output.pagination.total).toBe(3);
    expect(output.pagination.page).toBe(1);
    expect(output.pagination.limit).toBe(2);
    expect(output.pagination.totalPages).toBe(2);
  });

  it('should fail when tournament does not exist', async () => {
    // Arrange
    const nonExistentTournamentId = '123e4567-e89b-12d3-a456-426614174999';
    const input: GetTournamentStatisticsInput = { tournamentId: nonExistentTournamentId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Tournament not found');
  });

  it('should fail when tournament has no participants', async () => {
    // Arrange
    const emptyTournamentId = '123e4567-e89b-12d3-a456-426614174111';
    const emptyTournament = new Tournament(
      emptyTournamentId,
      'Empty Tournament',
      'No participants',
      new Date(),
      null, // endDate
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Location',
      16, // maxParticipants
      null, // registrationDeadline
      PlayerLevel.P3,
      'creator-id', // createdById
      new Date(),
      new Date(),
    );

    // Create a tournament with no participants
    tournamentRepository = new MockTournamentRepository(
      [tournament, emptyTournament],
      participants,
    );

    useCase = new GetTournamentStatisticsUseCase(
      statisticRepository,
      tournamentRepository,
      playerRepository,
    );

    const input: GetTournamentStatisticsInput = { tournamentId: emptyTournamentId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('No participants found in this tournament');
  });

  it('should fail when participants have no statistics', async () => {
    // Arrange
    const noStatsPlayerId = '123e4567-e89b-12d3-a456-426614174222';
    const noStatsPlayer = new Player(
      noStatsPlayerId,
      'user4',
      PlayerLevel.P3,
      22,
      'Germany',
      'nostats.jpg',
    );

    // Create a tournament where the participant has no statistics
    const noStatsTournamentId = '123e4567-e89b-12d3-a456-426614174333';
    const noStatsTournament = new Tournament(
      noStatsTournamentId,
      'No Stats Tournament',
      'Participants with no stats',
      new Date(),
      null, // endDate
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Location',
      16, // maxParticipants
      null, // registrationDeadline
      PlayerLevel.P3,
      'creator-id', // createdById
      new Date(),
      new Date(),
    );

    const noStatsParticipants = [
      { tournamentId: noStatsTournamentId, playerIds: [noStatsPlayerId] },
    ];

    tournamentRepository = new MockTournamentRepository(
      [tournament, noStatsTournament],
      [...participants, ...noStatsParticipants],
    );

    playerRepository = new MockPlayerRepository([...players, noStatsPlayer]);

    // Use empty statistics repository for this test
    statisticRepository = new MockStatisticRepository([]);

    useCase = new GetTournamentStatisticsUseCase(
      statisticRepository,
      tournamentRepository,
      playerRepository,
    );

    const input: GetTournamentStatisticsInput = { tournamentId: noStatsTournamentId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('No statistics found for tournament participants');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const invalidInput = { tournamentId: 'not-a-uuid' };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid tournament ID format');
  });

  it('should sort by win rate in ascending order correctly', async () => {
    // Arrange
    const input: GetTournamentStatisticsInput = {
      tournamentId,
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
    expect(output.statistics[2].playerId).toBe(player1Id); // 70% win rate
  });

  it('should sort by total points in descending order correctly', async () => {
    // Arrange
    const input: GetTournamentStatisticsInput = {
      tournamentId,
      pagination: {
        sortBy: 'totalPoints',
        sortOrder: 'desc',
      },
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    // The statistics should be sorted by total points in descending order
    expect(output.statistics[0].playerId).toBe(player3Id); // 140 points
    expect(output.statistics[1].playerId).toBe(player1Id); // 120 points
    expect(output.statistics[2].playerId).toBe(player2Id); // 80 points
  });

  it('should handle the second page of results correctly', async () => {
    // Arrange
    const input: GetTournamentStatisticsInput = {
      tournamentId,
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
    // Second page should have only the player with the least matches played
    expect(output.statistics).toHaveLength(1);
    expect(output.statistics[0].playerId).toBe(player2Id);
    expect(output.statistics[0].matchesPlayed).toBe(8);

    // Pagination values should reflect the second page
    expect(output.pagination.page).toBe(2);
    expect(output.pagination.totalPages).toBe(2);
  });
});
