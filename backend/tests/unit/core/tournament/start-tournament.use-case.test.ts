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

describe('StartTournamentUseCase', () => {
  let useCase: StartTournamentUseCase;
  let tournamentRepository: ITournamentRepository;
  let userRepository: IUserRepository;
  let generateTournamentBracketUseCase: GenerateTournamentBracketUseCase;
  let draftTournament: Tournament;
  let adminUser: User;
  let creatorUser: User;
  let player1: User;
  let player2: User;

  beforeEach(async () => {
    // Create test users
    adminUser = new User(
      '123e4567-e89b-12d3-a456-426614174000',
      'admin@test.com',
      'password',
      'Admin User',
      UserRole.ADMIN
    );
    creatorUser = new User(
      '123e4567-e89b-12d3-a456-426614174001',
      'creator@test.com',
      'password',
      'Creator User',
      UserRole.PLAYER
    );
    player1 = new User(
      '123e4567-e89b-12d3-a456-426614174002',
      'player1@test.com',
      'password',
      'Player 1',
      UserRole.PLAYER
    );
    player2 = new User(
      '123e4567-e89b-12d3-a456-426614174003',
      'player2@test.com',
      'password',
      'Player 2',
      UserRole.PLAYER
    );

    // Create test tournament
    draftTournament = new Tournament(
      '123e4567-e89b-12d3-a456-426614174004',
      'Draft Tournament',
      'Tournament in draft state',
      new Date(),
      new Date(),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Test Location',
      16,
      new Date(),
      PlayerLevel.P3,
      creatorUser.id,
      new Date(),
      new Date()
    );

    // Initialize repositories with test data
    tournamentRepository = new MockTournamentRepository([draftTournament]);
    userRepository = new MockUserRepository([adminUser, creatorUser, player1, player2]);

    // Register participants
    await tournamentRepository.registerParticipant(draftTournament.id, player1.id);
    await tournamentRepository.registerParticipant(draftTournament.id, player2.id);

    // Mock bracket generator
    generateTournamentBracketUseCase = {
      execute: jest.fn().mockResolvedValue(Result.ok({ matchesCreated: 1 })),
    } as any;

    // Initialize use case
    useCase = new StartTournamentUseCase(
      tournamentRepository,
      userRepository,
      generateTournamentBracketUseCase
    );
  });

  it('should successfully start a DRAFT tournament by admin', async () => {
    // Arrange
    const input = {
      tournamentId: draftTournament.id,
      userId: adminUser.id,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.ACTIVE);
  });

  it('should successfully start a DRAFT tournament by creator', async () => {
    // Arrange
    const input = {
      tournamentId: draftTournament.id,
      userId: creatorUser.id,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.ACTIVE);
  });

  it('should fail to start a non-DRAFT tournament', async () => {
    // First start the tournament
    await useCase.execute({
      tournamentId: draftTournament.id,
      userId: adminUser.id,
    });

    // Try to start it again
    const result = await useCase.execute({
      tournamentId: draftTournament.id,
      userId: adminUser.id,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Cannot start tournament: Current status is ACTIVE, but must be DRAFT');
  });

  it('should start a tournament and generate a bracket successfully', async () => {
    // Arrange
    const input = {
      tournamentId: draftTournament.id,
      userId: adminUser.id,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);
    if (result.isSuccess()) {
      expect(result.getValue().tournament.status).toBe(TournamentStatus.ACTIVE);
      expect(generateTournamentBracketUseCase.execute).toHaveBeenCalledWith({
        tournamentId: draftTournament.id,
        userId: adminUser.id,
      });
    }
  });

  it('should revert tournament status if bracket generation fails', async () => {
    // Arrange
    const input = {
      tournamentId: draftTournament.id,
      userId: adminUser.id,
    };

    // Configure bracket generation to fail
    generateTournamentBracketUseCase.execute = jest.fn().mockResolvedValue(
      Result.fail(new Error('Bracket generation failed'))
    );

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Tournament started but bracket generation failed');

    // Tournament should have been reverted to DRAFT status
    const tournament = await tournamentRepository.findById(input.tournamentId);
    expect(tournament?.status).toBe(TournamentStatus.DRAFT);
  });
});
