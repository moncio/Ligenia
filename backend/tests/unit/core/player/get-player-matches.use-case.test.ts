import {
  GetPlayerMatchesUseCase,
  GetPlayerMatchesInput,
} from '../../../../src/core/application/use-cases/player/get-player-matches.use-case';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import {
  IMatchRepository,
  MatchFilter,
} from '../../../../src/core/application/interfaces/repositories/match.repository';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock Player Repository
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
    player.id = `player-${this.players.length + 1}`;
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

// Mock Match Repository
class MockMatchRepository implements IMatchRepository {
  private matches: Match[] = [];

  constructor(initialMatches: Match[] = []) {
    this.matches = initialMatches;
  }

  async findById(id: string): Promise<Match | null> {
    return this.matches.find(m => m.id === id) || null;
  }

  async findByFilter(filter: MatchFilter): Promise<Match[]> {
    let result = [...this.matches];

    if (filter.userId) {
      // For simplicity, we check if the userId matches any player in the match
      result = result.filter(
        m =>
          m.homePlayerOneId === filter.userId ||
          m.homePlayerTwoId === filter.userId ||
          m.awayPlayerOneId === filter.userId ||
          m.awayPlayerTwoId === filter.userId,
      );
    }

    if (filter.tournamentId) {
      result = result.filter(m => m.tournamentId === filter.tournamentId);
    }

    if (filter.status) {
      result = result.filter(m => m.status === filter.status);
    }

    if (filter.round) {
      result = result.filter(m => m.round === filter.round);
    }

    if (filter.fromDate) {
      result = result.filter(m => m.date && m.date >= filter.fromDate);
    }

    if (filter.toDate) {
      result = result.filter(m => m.date && m.date <= filter.toDate);
    }

    // Apply pagination
    if (filter.offset !== undefined && filter.limit !== undefined) {
      result = result.slice(filter.offset, filter.offset + filter.limit);
    }

    return result;
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
    if (!match.id) {
      match.id = `match-${this.matches.length + 1}`;
    }
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

  async count(filter: MatchFilter): Promise<number> {
    let result = [...this.matches];

    if (filter.userId) {
      // For simplicity, we check if the userId matches any player in the match
      result = result.filter(
        m =>
          m.homePlayerOneId === filter.userId ||
          m.homePlayerTwoId === filter.userId ||
          m.awayPlayerOneId === filter.userId ||
          m.awayPlayerTwoId === filter.userId,
      );
    }

    if (filter.tournamentId) {
      result = result.filter(m => m.tournamentId === filter.tournamentId);
    }

    if (filter.status) {
      result = result.filter(m => m.status === filter.status);
    }

    if (filter.round) {
      result = result.filter(m => m.round === filter.round);
    }

    if (filter.fromDate) {
      result = result.filter(m => m.date && m.date >= filter.fromDate);
    }

    if (filter.toDate) {
      result = result.filter(m => m.date && m.date <= filter.toDate);
    }

    return result.length;
  }
}

describe('GetPlayerMatchesUseCase', () => {
  let useCase: GetPlayerMatchesUseCase;
  let playerRepository: IPlayerRepository;
  let matchRepository: IMatchRepository;
  let testPlayer: Player;
  let testMatches: Match[];

  beforeEach(() => {
    // Create test player
    testPlayer = new Player(
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
      PlayerLevel.P3,
      30,
      'Spain',
    );

    // Create test matches
    testMatches = [
      new Match(
        '123e4567-e89b-12d3-a456-426614174100',
        '123e4567-e89b-12d3-a456-426614174200', // Tournament ID
        testPlayer.userId, // Player is playing in this match
        'other-user-id',
        'opponent-user-id-1',
        'opponent-user-id-2',
        1, // Round
        new Date('2023-06-01'), // Date
        'Court 1',
        MatchStatus.COMPLETED,
        21, // Home score
        15, // Away score
      ),
      new Match(
        '123e4567-e89b-12d3-a456-426614174101',
        '123e4567-e89b-12d3-a456-426614174200', // Same tournament
        'other-user-id-1',
        'other-user-id-2',
        testPlayer.userId, // Player is playing in this match
        'opponent-user-id-3',
        2, // Round
        new Date('2023-06-10'), // Date
        'Court 2',
        MatchStatus.PENDING,
        null, // Scores are null for pending matches
        null,
      ),
      new Match(
        '123e4567-e89b-12d3-a456-426614174102',
        '123e4567-e89b-12d3-a456-426614174201', // Different tournament
        'other-user-id-3',
        'other-user-id-4',
        'opponent-user-id-4',
        'opponent-user-id-5',
        1, // Round
        new Date('2023-06-15'), // Date
        'Court 3',
        MatchStatus.SCHEDULED,
        null,
        null,
      ),
      new Match(
        '123e4567-e89b-12d3-a456-426614174103',
        '123e4567-e89b-12d3-a456-426614174201', // Different tournament
        testPlayer.userId, // Player is playing in this match
        'other-user-id-5',
        'opponent-user-id-6',
        'opponent-user-id-7',
        2, // Round
        new Date('2023-06-20'), // Date
        'Court 4',
        MatchStatus.SCHEDULED,
        null,
        null,
      ),
      new Match(
        '123e4567-e89b-12d3-a456-426614174104',
        '123e4567-e89b-12d3-a456-426614174202', // Different tournament
        'other-user-id-6',
        'other-user-id-7',
        testPlayer.userId, // Player is playing in this match
        'opponent-user-id-8',
        3, // Round
        new Date('2023-07-01'), // Date
        'Court 5',
        MatchStatus.CANCELED,
        null,
        null,
      ),
    ];

    // Initialize repositories with test data
    playerRepository = new MockPlayerRepository([testPlayer]);
    matchRepository = new MockMatchRepository(testMatches);

    // Initialize use case
    useCase = new GetPlayerMatchesUseCase(matchRepository, playerRepository);
  });

  it('should get all player matches with default pagination', async () => {
    // Arrange
    const input: GetPlayerMatchesInput = {
      playerId: testPlayer.id,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { matches, total, skip, limit } = result.getValue();
    expect(matches).toHaveLength(4); // All matches where the player is playing
    expect(total).toBe(4);
    expect(skip).toBe(0);
    expect(limit).toBe(10);
  });

  it('should filter matches by status', async () => {
    // Arrange
    const input: GetPlayerMatchesInput = {
      playerId: testPlayer.id,
      status: MatchStatus.SCHEDULED,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { matches, total } = result.getValue();
    expect(matches).toHaveLength(1);
    expect(total).toBe(1);
    expect(matches[0].status).toBe(MatchStatus.SCHEDULED);
  });

  it('should filter matches by tournament ID', async () => {
    // Arrange
    const input: GetPlayerMatchesInput = {
      playerId: testPlayer.id,
      tournamentId: '123e4567-e89b-12d3-a456-426614174200',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { matches, total } = result.getValue();
    expect(matches).toHaveLength(2);
    expect(total).toBe(2);
    expect(matches.every(m => m.tournamentId === '123e4567-e89b-12d3-a456-426614174200')).toBe(
      true,
    );
  });

  it('should filter matches by date range', async () => {
    // Arrange
    const input: GetPlayerMatchesInput = {
      playerId: testPlayer.id,
      fromDate: new Date('2023-06-10'),
      toDate: new Date('2023-06-30'),
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { matches, total } = result.getValue();
    expect(matches).toHaveLength(2);
    expect(total).toBe(2);
    // Check that all matches are within the date range
    expect(
      matches.every(
        m => m.date && m.date >= new Date('2023-06-10') && m.date <= new Date('2023-06-30'),
      ),
    ).toBe(true);
  });

  it('should apply pagination correctly', async () => {
    // Arrange
    const input: GetPlayerMatchesInput = {
      playerId: testPlayer.id,
      skip: 1,
      limit: 2,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { matches, total, skip, limit } = result.getValue();
    expect(matches).toHaveLength(2);
    expect(total).toBe(4);
    expect(skip).toBe(1);
    expect(limit).toBe(2);
  });

  it('should fail when player does not exist', async () => {
    // Arrange
    const input: GetPlayerMatchesInput = {
      playerId: '123e4567-e89b-12d3-a456-426614174999', // non-existent player ID
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Player not found');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const input = {
      playerId: 'not-a-uuid',
      status: 'INVALID_STATUS',
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid player ID format');
  });
});
