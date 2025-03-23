import {
  GetPlayerTournamentsUseCase,
  GetPlayerTournamentsInput,
} from '../../../../src/core/application/use-cases/player/get-player-tournaments.use-case';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import {
  ITournamentRepository,
  PaginationOptions,
  TournamentFilter,
} from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { Player } from '../../../../src/core/domain/player/player.entity';
import {
  Tournament,
  TournamentStatus,
  TournamentFormat,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';

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

// Mock Tournament Repository
class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Tournament[] = [];
  private participantRegistrations: Map<string, Set<string>> = new Map(); // tournamentId -> Set of playerIds

  constructor(
    initialTournaments: Tournament[] = [],
    initialRegistrations: Record<string, string[]> = {},
  ) {
    this.tournaments = initialTournaments;

    // Initialize participant registrations
    Object.entries(initialRegistrations).forEach(([tournamentId, playerIds]) => {
      const playerSet = new Set<string>(playerIds);
      this.participantRegistrations.set(tournamentId, playerSet);
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(t => t.id === id) || null;
  }

  async findAll(filter?: TournamentFilter, pagination?: PaginationOptions): Promise<Tournament[]> {
    let result = this.tournaments.map(t => {
      // Properly recreate Tournament objects to ensure we have all methods
      return new Tournament(
        t.id,
        t.name,
        t.description,
        new Date(t.startDate),
        t.endDate ? new Date(t.endDate) : null,
        t.format,
        t.status,
        t.location,
        t.maxParticipants,
        t.registrationDeadline ? new Date(t.registrationDeadline) : null,
        t.category,
        t.createdById,
        new Date(t.createdAt),
        t.updatedAt ? new Date(t.updatedAt) : new Date(),
      );
    });

    // Apply filters
    if (filter) {
      if (filter.status !== undefined) {
        result = result.filter(t => t.status === filter.status);
      }
      if (filter.category !== undefined) {
        result = result.filter(t => t.category === filter.category);
      }
      if (filter.dateRange) {
        if (filter.dateRange.from) {
          result = result.filter(t => t.startDate >= filter.dateRange.from!);
        }
        if (filter.dateRange.to) {
          result = result.filter(t => t.startDate <= filter.dateRange.to!);
        }
      }
      if (filter.searchTerm !== undefined) {
        const searchTerm = filter.searchTerm.toLowerCase();
        result = result.filter(
          t =>
            t.name.toLowerCase().includes(searchTerm) ||
            t.description.toLowerCase().includes(searchTerm),
        );
      }
    }

    // Apply sorting
    if (pagination?.sort) {
      const { field, order } = pagination.sort;
      result.sort((a: any, b: any) => {
        if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    if (pagination) {
      const skip = pagination.skip || 0;
      const limit = pagination.limit || 10;
      result = result.slice(skip, skip + limit);
    }

    return result;
  }

  async count(filter?: TournamentFilter): Promise<number> {
    let result = [...this.tournaments];

    // Apply filters - same as findAll
    if (filter) {
      if (filter.status !== undefined) {
        result = result.filter(t => t.status === filter.status);
      }
      if (filter.category !== undefined) {
        result = result.filter(t => t.category === filter.category);
      }
      if (filter.dateRange) {
        if (filter.dateRange.from) {
          result = result.filter(t => t.startDate >= filter.dateRange.from!);
        }
        if (filter.dateRange.to) {
          result = result.filter(t => t.startDate <= filter.dateRange.to!);
        }
      }
      if (filter.searchTerm !== undefined) {
        const searchTerm = filter.searchTerm.toLowerCase();
        result = result.filter(
          t =>
            t.name.toLowerCase().includes(searchTerm) ||
            t.description.toLowerCase().includes(searchTerm),
        );
      }
    }

    return result.length;
  }

  async save(tournament: Tournament): Promise<void> {
    if (!tournament.id) {
      tournament.id = `tournament-${this.tournaments.length + 1}`;
    }
    this.tournaments.push(tournament);
    this.participantRegistrations.set(tournament.id, new Set<string>());
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
      this.participantRegistrations.delete(id);
    }
  }

  async countParticipants(tournamentId: string): Promise<number> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? participants.size : 0;
  }

  async registerParticipant(tournamentId: string, playerId: string): Promise<void> {
    let participants = this.participantRegistrations.get(tournamentId);
    if (!participants) {
      participants = new Set<string>();
      this.participantRegistrations.set(tournamentId, participants);
    }
    participants.add(playerId);
  }

  async unregisterParticipant(tournamentId: string, playerId: string): Promise<void> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (participants) {
      participants.delete(playerId);
    }
  }

  async isParticipantRegistered(tournamentId: string, playerId: string): Promise<boolean> {
    console.log(`Checking if player ${playerId} is registered for tournament ${tournamentId}`);
    console.log(
      `Participants for tournament ${tournamentId}:`,
      this.participantRegistrations.get(tournamentId),
    );
    const participants = this.participantRegistrations.get(tournamentId);
    return !!participants && participants.has(playerId);
  }

  async getParticipants(tournamentId: string, pagination?: PaginationOptions): Promise<string[]> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (!participants) {
      return [];
    }

    const participantArray = Array.from(participants);

    if (pagination) {
      return participantArray.slice(pagination.skip, pagination.skip + pagination.limit);
    }

    return participantArray;
  }

  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    return this.countParticipants(tournamentId);
  }
}

describe('GetPlayerTournamentsUseCase', () => {
  let useCase: GetPlayerTournamentsUseCase;
  let playerRepository: IPlayerRepository;
  let tournamentRepository: ITournamentRepository;
  let testPlayer: Player;
  let testTournaments: Tournament[];
  let playerRegistrations: Record<string, string[]>;

  beforeEach(() => {
    // Create a test player
    testPlayer = new Player(
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
      PlayerLevel.P3,
      30,
      'Spain',
    );

    // Create test tournaments
    testTournaments = [
      new Tournament(
        '123e4567-e89b-12d3-a456-426614174100',
        'Tennis Open Tournament',
        'A major tennis tournament',
        new Date('2023-06-01'),
        new Date('2023-06-10'),
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.COMPLETED,
        'Tennis Court A',
        32,
        new Date('2023-05-25'),
        PlayerLevel.P3,
        'admin-user-id',
      ),
      new Tournament(
        '123e4567-e89b-12d3-a456-426614174101',
        'Summer Championship',
        'Summer championship for all levels',
        new Date('2023-07-05'),
        new Date('2023-07-15'),
        TournamentFormat.DOUBLE_ELIMINATION,
        TournamentStatus.OPEN,
        'Sports Complex',
        64,
        new Date('2023-06-30'),
        null, // No specific category
        'admin-user-id',
      ),
      new Tournament(
        '123e4567-e89b-12d3-a456-426614174102',
        'Winter Tournament',
        'Winter indoor tournament',
        new Date('2023-12-10'),
        new Date('2023-12-20'),
        TournamentFormat.ROUND_ROBIN,
        TournamentStatus.DRAFT,
        'Indoor Arena',
        16,
        new Date('2023-11-30'),
        PlayerLevel.P2,
        'admin-user-id',
      ),
      new Tournament(
        '123e4567-e89b-12d3-a456-426614174103',
        'Beach Volleyball Cup',
        'Beach volleyball tournament',
        new Date('2023-08-15'),
        new Date('2023-08-20'),
        TournamentFormat.SWISS,
        TournamentStatus.ACTIVE,
        'Beach Arena',
        24,
        new Date('2023-08-01'),
        PlayerLevel.P3,
        'admin-user-id',
      ),
      new Tournament(
        '123e4567-e89b-12d3-a456-426614174104',
        'Fall Championship',
        'Fall championship for all levels',
        new Date('2023-10-05'),
        new Date('2023-10-15'),
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.CANCELLED,
        'Sports Complex B',
        32,
        new Date('2023-09-25'),
        PlayerLevel.P4,
        'admin-user-id',
      ),
    ];

    // Setup player registrations - player is registered for tournaments 0, 1, and 3
    playerRegistrations = {
      '123e4567-e89b-12d3-a456-426614174100': [testPlayer.id], // Tennis Open
      '123e4567-e89b-12d3-a456-426614174101': [testPlayer.id], // Summer Championship
      '123e4567-e89b-12d3-a456-426614174103': [testPlayer.id], // Beach Volleyball Cup
    };

    console.log('Player ID:', testPlayer.id);
    console.log('Tournament registrations:', playerRegistrations);

    // Initialize repositories
    playerRepository = new MockPlayerRepository([testPlayer]);
    tournamentRepository = new MockTournamentRepository(testTournaments, playerRegistrations);

    // Test to verify registrations were set up correctly
    Object.keys(playerRegistrations).forEach(async tournamentId => {
      const isRegistered = await tournamentRepository.isParticipantRegistered(
        tournamentId,
        testPlayer.id,
      );
      console.log(`Is player registered for tournament ${tournamentId}:`, isRegistered);
    });

    // Initialize use case
    useCase = new GetPlayerTournamentsUseCase(tournamentRepository, playerRepository);
  });

  it('should get all tournaments for a player with default pagination', async () => {
    // Arrange
    const input: GetPlayerTournamentsInput = {
      playerId: testPlayer.id,
    };

    // Act
    const result = await useCase.execute(input);
    console.log('Default pagination test result:', result.getValue());

    // Assert
    expect(result.isSuccess).toBe(true);

    const { tournaments, total, skip, limit } = result.getValue();
    console.log('Tournaments in default pagination test:', JSON.stringify(tournaments));
    expect(tournaments).toHaveLength(3); // Player is registered for 3 tournaments
    expect(total).toBe(3);
    expect(skip).toBe(0);
    expect(limit).toBe(10);
  });

  it('should filter tournaments by status', async () => {
    // Arrange
    const input: GetPlayerTournamentsInput = {
      playerId: testPlayer.id,
      status: TournamentStatus.ACTIVE,
    };

    // Act
    const result = await useCase.execute(input);
    console.log('Status filter test result:', result.getValue());

    // Assert
    expect(result.isSuccess).toBe(true);

    const { tournaments, total } = result.getValue();
    console.log('Status filtered tournaments:', JSON.stringify(tournaments));
    expect(tournaments).toHaveLength(1);
    expect(total).toBe(1);
    expect(tournaments[0].status).toBe(TournamentStatus.ACTIVE);
  });

  it('should filter tournaments by date range', async () => {
    // Arrange
    const input: GetPlayerTournamentsInput = {
      playerId: testPlayer.id,
      fromDate: new Date('2023-07-01'),
      toDate: new Date('2023-09-01'),
    };

    // Act
    const result = await useCase.execute(input);
    console.log('Date range filter test result:', result.getValue());

    // Assert
    expect(result.isSuccess).toBe(true);

    const { tournaments, total } = result.getValue();
    console.log('Date range filtered tournaments:', JSON.stringify(tournaments));
    expect(tournaments).toHaveLength(2); // Summer Championship and Beach Volleyball Cup
    expect(total).toBe(2);
    // Check that all tournaments are within the date range
    expect(
      tournaments.every(
        t => t.startDate >= new Date('2023-07-01') && t.startDate <= new Date('2023-09-01'),
      ),
    ).toBe(true);
  });

  it('should filter tournaments by category', async () => {
    // Arrange
    const input: GetPlayerTournamentsInput = {
      playerId: testPlayer.id,
      category: PlayerLevel.P3,
    };

    // Act
    const result = await useCase.execute(input);
    console.log('Category filter test result:', result.getValue());

    // Assert
    expect(result.isSuccess).toBe(true);

    const { tournaments, total } = result.getValue();
    console.log('Category filtered tournaments:', JSON.stringify(tournaments));
    expect(tournaments).toHaveLength(2); // Tennis Open and Beach Volleyball Cup
    expect(total).toBe(2);
    expect(tournaments.every(t => t.category === PlayerLevel.P3)).toBe(true);
  });

  it('should apply pagination correctly', async () => {
    // Arrange
    const input: GetPlayerTournamentsInput = {
      playerId: testPlayer.id,
      skip: 1,
      limit: 1,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { tournaments, total, skip, limit } = result.getValue();
    expect(tournaments).toHaveLength(1);
    expect(total).toBe(3); // Total should still be 3, even though we're only returning 1
    expect(skip).toBe(1);
    expect(limit).toBe(1);
  });

  it('should fail when player does not exist', async () => {
    // Arrange
    const input: GetPlayerTournamentsInput = {
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
