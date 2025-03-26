import {
  StartTournamentUseCase,
  StartTournamentInput,
} from '../../../../src/core/application/use-cases/tournament/start-tournament.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
  TournamentFilter,
  PaginationOptions,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import {
  GenerateTournamentBracketUseCase,
  GenerateTournamentBracketOutput,
  GenerateTournamentBracketInput,
} from '../../../../src/core/application/use-cases/tournament/generate-tournament-bracket.use-case';
import { Result } from '../../../../src/shared/result';

// Mock Tournament Repository
class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Map<string, Tournament> = new Map();
  private participantRegistrations: Map<string, Set<string>> = new Map();
  private stateHistory: Map<string, Array<{ status: TournamentStatus; timestamp: Date }>> = new Map();

  constructor(initialTournaments: Tournament[] = []) {
    console.log('Initializing MockTournamentRepository with tournaments:', initialTournaments.length);
    initialTournaments.forEach(tournament => {
      this.tournaments.set(tournament.id, tournament);
      this.participantRegistrations.set(tournament.id, new Set<string>());
      this.stateHistory.set(tournament.id, [{
        status: tournament.status,
        timestamp: tournament.updatedAt
      }]);
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    const tournament = this.tournaments.get(id);
    if (tournament) {
      console.log('Found tournament:', {
        id,
        name: tournament.name,
        status: tournament.status,
        updatedAt: tournament.updatedAt
      });
    }
    return tournament || null;
  }

  async findAll(filter?: TournamentFilter, pagination?: PaginationOptions): Promise<Tournament[]> {
    let tournaments = Array.from(this.tournaments.values());

    // Apply filters if specified
    if (filter) {
      tournaments = tournaments.filter(tournament => {
        if (filter.status && tournament.status !== filter.status) return false;
        if (filter.category && tournament.category !== filter.category) return false;
        if (filter.dateRange) {
          if (filter.dateRange.from && tournament.startDate < filter.dateRange.from) return false;
          if (filter.dateRange.to && tournament.startDate > filter.dateRange.to) return false;
        }
        if (filter.searchTerm) {
          const searchLower = filter.searchTerm.toLowerCase();
          return tournament.name.toLowerCase().includes(searchLower) ||
                 tournament.description.toLowerCase().includes(searchLower);
        }
        return true;
      });
    }

    // Apply pagination if specified
    if (pagination) {
      const { skip, limit } = pagination;
      tournaments = tournaments.slice(skip, skip + limit);
    }

    // Apply sorting if specified
    if (pagination?.sort) {
      const { field, order } = pagination.sort;
      tournaments.sort((a, b) => {
        const aValue = a[field as keyof Tournament];
        const bValue = b[field as keyof Tournament];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return tournaments;
  }

  async count(filter?: TournamentFilter): Promise<number> {
    const tournaments = await this.findAll(filter);
    return tournaments.length;
  }

  async save(tournament: Tournament): Promise<void> {
    console.log('Saving tournament:', {
      id: tournament.id,
      name: tournament.name,
      status: tournament.status
    });

    // Create a new Tournament instance to ensure proper state
    const newTournament = new Tournament(
      tournament.id,
      tournament.name,
      tournament.description,
      tournament.startDate,
      tournament.endDate,
      tournament.format,
      tournament.status,
      tournament.location,
      tournament.maxParticipants,
      tournament.registrationDeadline,
      tournament.category,
      tournament.createdById,
      tournament.createdAt,
      tournament.updatedAt
    );

    // Store the new instance
    this.tournaments.set(tournament.id, newTournament);

    // Initialize participant registrations if needed
    if (!this.participantRegistrations.has(tournament.id)) {
      this.participantRegistrations.set(tournament.id, new Set<string>());
    }

    // Initialize state history if needed
    if (!this.stateHistory.has(tournament.id)) {
      this.stateHistory.set(tournament.id, [{
        status: tournament.status,
        timestamp: tournament.updatedAt
      }]);
    }

    // Verify state was saved correctly
    const storedTournament = this.tournaments.get(tournament.id)!;
    if (storedTournament.status !== tournament.status) {
      console.error('State verification failed:', {
        expectedStatus: tournament.status,
        actualStatus: storedTournament.status
      });
      throw new Error('Tournament state was not saved correctly');
    }
  }

  async update(tournament: Tournament): Promise<void> {
    if (this.tournaments.has(tournament.id)) {
      // Get current state before update
      const currentTournament = this.tournaments.get(tournament.id)!;
      console.log('Updating tournament:', {
        id: tournament.id,
        name: tournament.name,
        oldStatus: currentTournament.status,
        newStatus: tournament.status,
        oldUpdatedAt: currentTournament.updatedAt,
        newUpdatedAt: tournament.updatedAt
      });

      // Create a new Tournament instance to ensure proper state
      const updatedTournament = new Tournament(
        tournament.id,
        tournament.name,
        tournament.description,
        tournament.startDate,
        tournament.endDate,
        tournament.format,
        tournament.status,
        tournament.location,
        tournament.maxParticipants,
        tournament.registrationDeadline,
        tournament.category,
        tournament.createdById,
        tournament.createdAt,
        tournament.updatedAt
      );

      // Store the new instance
      this.tournaments.set(tournament.id, updatedTournament);

      // Record state change in history
      const history = this.stateHistory.get(tournament.id)!;
      history.push({
        status: tournament.status,
        timestamp: tournament.updatedAt
      });

      // Verify state was updated correctly
      const storedTournament = this.tournaments.get(tournament.id)!;
      if (storedTournament.status !== tournament.status) {
        console.error('State verification failed:', {
          expectedStatus: tournament.status,
          actualStatus: storedTournament.status
        });
        throw new Error('Tournament state was not updated correctly');
      }
    } else {
      console.error('Attempted to update non-existent tournament:', tournament.id);
      throw new Error(`Tournament with ID ${tournament.id} not found`);
    }
  }

  async delete(id: string): Promise<void> {
    this.tournaments.delete(id);
    this.participantRegistrations.delete(id);
  }

  async countParticipants(tournamentId: string): Promise<number> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? participants.size : 0;
  }

  async registerParticipant(tournamentId: string, playerId: string): Promise<void> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (participants) {
      participants.add(playerId);
    } else {
      this.participantRegistrations.set(tournamentId, new Set<string>([playerId]));
    }
  }

  async unregisterParticipant(tournamentId: string, playerId: string): Promise<void> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (participants) {
      participants.delete(playerId);
    }
  }

  async isParticipantRegistered(tournamentId: string, playerId: string): Promise<boolean> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? participants.has(playerId) : false;
  }

  async getParticipants(tournamentId: string, pagination?: PaginationOptions): Promise<string[]> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (!participants) return [];

    let result = Array.from(participants);

    // Apply pagination if specified
    if (pagination) {
      const { skip, limit } = pagination;
      result = result.slice(skip, skip + limit);
    }

    // Apply sorting if specified
    if (pagination?.sort) {
      const { order } = pagination.sort;
      result.sort((a, b) => {
        if (order === 'asc') {
          return a.localeCompare(b);
        } else {
          return b.localeCompare(a);
        }
      });
    }

    return result;
  }

  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    return this.countParticipants(tournamentId);
  }

  // Helper method to get tournament state history
  getTournamentStateHistory(tournamentId: string): Array<{ status: TournamentStatus; timestamp: Date }> {
    return this.stateHistory.get(tournamentId) || [];
  }

  // Helper method to verify tournament state
  verifyTournamentState(tournamentId: string, expectedStatus: TournamentStatus): boolean {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return false;
    return tournament.status === expectedStatus;
  }
}

// Mock User Repository
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    return this.users.slice(offset || 0, (offset || 0) + (limit || this.users.length));
  }

  async count(): Promise<number> {
    return this.users.length;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

// Mock GenerateTournamentBracketUseCase
class MockGenerateTournamentBracketUseCase extends GenerateTournamentBracketUseCase {
  constructor() {
    super(null as any, null as any, null as any);
  }

  executeResult: Result<GenerateTournamentBracketOutput> = Result.ok({
    tournamentId: '',
    format: TournamentFormat.SINGLE_ELIMINATION,
    rounds: 3,
    matchesCreated: 4,
  });

  execute = jest.fn().mockImplementation(async (input: GenerateTournamentBracketInput) => {
    return this.executeResult;
  });
}

describe('StartTournamentUseCase', () => {
  let useCase: StartTournamentUseCase;
  let tournamentRepository: ITournamentRepository;
  let userRepository: IUserRepository;
  let generateTournamentBracketUseCase: MockGenerateTournamentBracketUseCase;

  // Tournament IDs for testing
  const draftTournamentId = '123e4567-e89b-12d3-a456-426614174000';
  const openTournamentId = '123e4567-e89b-12d3-a456-426614174001';
  const openTournamentWithoutPlayersId = '123e4567-e89b-12d3-a456-426614174002';
  const activeTournamentId = '123e4567-e89b-12d3-a456-426614174003';
  const completedTournamentId = '123e4567-e89b-12d3-a456-426614174004';
  const cancelledTournamentId = '123e4567-e89b-12d3-a456-426614174005';
  const nonExistingTournamentId = '123e4567-e89b-12d3-a456-426614174999';

  // User IDs for testing
  const adminUserId = '111e4567-e89b-12d3-a456-426614174000';
  const creatorUserId = '222e4567-e89b-12d3-a456-426614174000';
  const regularUserId = '333e4567-e89b-12d3-a456-426614174000';
  const player1UserId = '444e4567-e89b-12d3-a456-426614174000';
  const player2UserId = '555e4567-e89b-12d3-a456-426614174000';
  const nonExistingUserId = '999e4567-e89b-12d3-a456-426614174000';

  const createDate = (day: number, month: number, year: number): Date => {
    return new Date(year, month - 1, day);
  };

  beforeEach(() => {
    // Create sample tournaments
    const draftTournament = new Tournament(
      draftTournamentId,
      'Draft Tournament',
      'Tournament in draft state',
      createDate(15, 7, 2023),
      createDate(20, 7, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Madrid',
      16,
      createDate(10, 7, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 7, 2023),
      createDate(1, 7, 2023),
    );

    const openTournament = new Tournament(
      openTournamentId,
      'Open Tournament',
      'Tournament in open state with enough players',
      createDate(15, 8, 2023),
      createDate(20, 8, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN,
      'Barcelona',
      16,
      createDate(10, 8, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 8, 2023),
      createDate(1, 8, 2023),
    );

    const openTournamentWithoutPlayers = new Tournament(
      openTournamentWithoutPlayersId,
      'Open Tournament Without Players',
      'Tournament in open state but without enough players',
      createDate(15, 9, 2023),
      createDate(20, 9, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN,
      'Valencia',
      16,
      createDate(10, 9, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 9, 2023),
      createDate(1, 9, 2023),
    );

    const activeTournament = new Tournament(
      activeTournamentId,
      'Active Tournament',
      'Tournament in active state',
      createDate(15, 10, 2023),
      createDate(20, 10, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.ACTIVE,
      'Seville',
      16,
      createDate(10, 10, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 10, 2023),
      createDate(1, 10, 2023),
    );

    const completedTournament = new Tournament(
      completedTournamentId,
      'Completed Tournament',
      'Tournament in completed state',
      createDate(15, 11, 2023),
      createDate(20, 11, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.COMPLETED,
      'Malaga',
      16,
      createDate(10, 11, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 11, 2023),
      createDate(1, 11, 2023),
    );

    const cancelledTournament = new Tournament(
      cancelledTournamentId,
      'Cancelled Tournament',
      'Tournament in cancelled state',
      createDate(15, 12, 2023),
      createDate(20, 12, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.CANCELLED,
      'Bilbao',
      16,
      createDate(10, 12, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 12, 2023),
      createDate(1, 12, 2023),
    );

    // Initialize repository with sample tournaments
    tournamentRepository = new MockTournamentRepository([
      draftTournament,
      openTournament,
      openTournamentWithoutPlayers,
      activeTournament,
      completedTournament,
      cancelledTournament,
    ]);

    // Register players for the open tournament
    tournamentRepository.registerParticipant(openTournamentId, player1UserId);
    tournamentRepository.registerParticipant(openTournamentId, player2UserId);
    // Register only one player for the other open tournament (not enough to start)
    tournamentRepository.registerParticipant(openTournamentWithoutPlayersId, player1UserId);

    // Create sample users
    const adminUser = new User(
      adminUserId,
      'admin@example.com',
      'password',
      'Admin User',
      UserRole.ADMIN
    );

    const creatorUser = new User(
      creatorUserId,
      'creator@example.com',
      'password',
      'Creator User',
      UserRole.PLAYER
    );

    const regularUser = new User(
      regularUserId,
      'regular@example.com',
      'password',
      'Regular User',
      UserRole.PLAYER
    );

    const player1User = new User(
      player1UserId,
      'player1@example.com',
      'password',
      'Player 1',
      UserRole.PLAYER,
      true,
      createDate(1, 1, 2023),
      createDate(1, 1, 2023),
    );

    const player2User = new User(
      player2UserId,
      'player2@example.com',
      'password',
      'Player 2',
      UserRole.PLAYER,
      true,
      createDate(1, 1, 2023),
      createDate(1, 1, 2023),
    );

    // Initialize user repository with sample users
    userRepository = new MockUserRepository([
      adminUser,
      creatorUser,
      regularUser,
      player1User,
      player2User,
    ]);

    // Setup mock generate tournament bracket use case
    generateTournamentBracketUseCase = new MockGenerateTournamentBracketUseCase();
    generateTournamentBracketUseCase.executeResult = Result.ok({
      tournamentId: openTournamentId,
      format: TournamentFormat.SINGLE_ELIMINATION,
      rounds: 3,
      matchesCreated: 4,
    });

    // Initialize use case
    useCase = new StartTournamentUseCase(
      tournamentRepository,
      userRepository,
      generateTournamentBracketUseCase,
    );
  });

  it('should successfully start an OPEN tournament by admin', async () => {
    const input: StartTournamentInput = {
      tournamentId: openTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.ACTIVE);
    expect(output.message).toContain('successfully');

    // Verify tournament is updated in repository
    const updatedTournament = await tournamentRepository.findById(openTournamentId);
    expect(updatedTournament?.status).toBe(TournamentStatus.ACTIVE);
  });

  it('should successfully start an OPEN tournament by creator', async () => {
    const input: StartTournamentInput = {
      tournamentId: openTournamentId,
      userId: creatorUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.ACTIVE);
    expect(output.message).toContain('successfully');

    // Verify tournament is updated in repository
    const updatedTournament = await tournamentRepository.findById(openTournamentId);
    expect(updatedTournament?.status).toBe(TournamentStatus.ACTIVE);
  });

  it('should fail when regular user tries to start a tournament', async () => {
    const input: StartTournamentInput = {
      tournamentId: openTournamentId,
      userId: regularUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only admins or the tournament creator');
  });

  it('should fail when trying to start a DRAFT tournament', async () => {
    const input: StartTournamentInput = {
      tournamentId: draftTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only tournaments in OPEN state');
  });

  it('should fail when trying to start an already ACTIVE tournament', async () => {
    const input: StartTournamentInput = {
      tournamentId: activeTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only tournaments in OPEN state');
  });

  it('should fail when trying to start a COMPLETED tournament', async () => {
    const input: StartTournamentInput = {
      tournamentId: completedTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only tournaments in OPEN state');
  });

  it('should fail when trying to start a CANCELLED tournament', async () => {
    const input: StartTournamentInput = {
      tournamentId: cancelledTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only tournaments in OPEN state');
  });

  it('should fail when trying to start a tournament without enough participants', async () => {
    const input: StartTournamentInput = {
      tournamentId: openTournamentWithoutPlayersId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('needs at least 2 participants');
  });

  it('should fail when tournament does not exist', async () => {
    const input: StartTournamentInput = {
      tournamentId: nonExistingTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('not found');
  });

  it('should fail when user does not exist', async () => {
    const input: StartTournamentInput = {
      tournamentId: openTournamentId,
      userId: nonExistingUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('User with ID');
    expect(result.getError().message).toContain('not found');
  });

  it('should fail with invalid input data', async () => {
    const input = {
      tournamentId: 'invalid-uuid',
      userId: adminUserId,
    } as StartTournamentInput;

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
  });

  it('should start a tournament and generate a bracket successfully', async () => {
    // Arrange
    const input: StartTournamentInput = {
      tournamentId: openTournamentId,
      userId: adminUserId,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    if (result.isSuccess()) {
      expect(result.getValue().tournament.status).toBe(TournamentStatus.ACTIVE);
      expect(result.getValue().message).toContain(
        'Tournament started successfully with 4 matches created',
      );
    }

    // Verify generateTournamentBracketUseCase was called with correct parameters
    expect(generateTournamentBracketUseCase.execute).toHaveBeenCalledWith({
      tournamentId: openTournamentId,
      userId: adminUserId,
    });
  });

  it('should revert tournament status if bracket generation fails', async () => {
    // Arrange
    const input: StartTournamentInput = {
      tournamentId: openTournamentId,
      userId: adminUserId,
    };

    // Mock bracket generation failure
    generateTournamentBracketUseCase.executeResult = Result.fail(
      new Error('Failed to generate bracket'),
    );

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Tournament started but bracket generation failed');

    // Tournament should have been reverted to OPEN status
    const tournament = await tournamentRepository.findById(openTournamentId);
    expect(tournament?.status).toBe(TournamentStatus.OPEN);
  });
});
