import {
  CompleteTournamentUseCase,
  CompleteTournamentInput,
} from '../../../../src/core/application/use-cases/tournament/complete-tournament.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { TournamentFilter } from '../../../../src/core/application/interfaces/repositories/tournament.repository';

// Mock Tournament Repository
class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Map<string, Tournament> = new Map();
  private participantRegistrations: Map<string, Set<string>> = new Map();

  constructor(initialTournaments: Tournament[] = []) {
    initialTournaments.forEach(tournament => {
      this.tournaments.set(tournament.id, tournament);
      this.participantRegistrations.set(tournament.id, new Set());
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.get(id) || null;
  }

  async findAll(filter?: TournamentFilter): Promise<Tournament[]> {
    let result = Array.from(this.tournaments.values());

    // Apply filters
    if (filter) {
      // Filter by status
      if (filter.status) {
        result = result.filter(t => t.status === filter.status);
      }

      // Filter by category
      if (filter.category) {
        result = result.filter(t => t.category === filter.category);
      }

      // Filter by date range
      if (filter.dateRange) {
        if (filter.dateRange.from) {
          result = result.filter(t => t.startDate >= filter.dateRange!.from!);
        }
        if (filter.dateRange.to) {
          result = result.filter(t => t.startDate <= filter.dateRange!.to!);
        }
      }

      // Filter by search term (name or location)
      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        result = result.filter(
          t =>
            t.name.toLowerCase().includes(term) ||
            (t.location && t.location.toLowerCase().includes(term)),
        );
      }
    }

    return result;
  }

  async count(filter?: TournamentFilter): Promise<number> {
    const tournaments = await this.findAll(filter);
    return tournaments.length;
  }

  async save(tournament: Tournament): Promise<void> {
    this.tournaments.set(tournament.id, tournament);
    this.participantRegistrations.set(tournament.id, new Set());
  }

  async update(tournament: Tournament): Promise<void> {
    this.tournaments.set(tournament.id, tournament);
  }

  async delete(id: string): Promise<void> {
    this.tournaments.delete(id);
    this.participantRegistrations.delete(id);
  }

  async getParticipants(tournamentId: string): Promise<string[]> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? Array.from(participants) : [];
  }

  async countParticipants(tournamentId: string): Promise<number> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? participants.size : 0;
  }

  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? participants.size : 0;
  }

  async registerParticipant(tournamentId: string, playerId: string): Promise<void> {
    const participants = this.participantRegistrations.get(tournamentId);
    if (participants) {
      participants.add(playerId);
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
}

// Mock User Repository
class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  constructor(initialUsers: User[] = []) {
    initialUsers.forEach(user => {
      this.users.set(user.id, user);
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async update(user: User): Promise<void> {
    if (this.users.has(user.id)) {
      this.users.set(user.id, user);
    }
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    const users = Array.from(this.users.values());
    return users.slice(offset || 0, (offset || 0) + (limit || users.length));
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

describe('CompleteTournamentUseCase', () => {
  let useCase: CompleteTournamentUseCase;
  let tournamentRepository: ITournamentRepository;
  let userRepository: IUserRepository;

  // Tournament IDs for testing
  const draftTournamentId = '123e4567-e89b-12d3-a456-426614174000';
  const openTournamentId = '123e4567-e89b-12d3-a456-426614174001';
  const activeTournamentId = '123e4567-e89b-12d3-a456-426614174002';
  const completedTournamentId = '123e4567-e89b-12d3-a456-426614174003';
  const cancelledTournamentId = '123e4567-e89b-12d3-a456-426614174004';
  const nonExistingTournamentId = '123e4567-e89b-12d3-a456-426614174999';

  // User IDs for testing
  const adminUserId = '111e4567-e89b-12d3-a456-426614174000';
  const creatorUserId = '222e4567-e89b-12d3-a456-426614174000';
  const regularUserId = '333e4567-e89b-12d3-a456-426614174000';
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
      'Tournament in open state',
      createDate(15, 8, 2023),
      createDate(20, 8, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Barcelona',
      16,
      createDate(10, 8, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 8, 2023),
      createDate(1, 8, 2023),
    );

    const activeTournament = new Tournament(
      activeTournamentId,
      'Active Tournament',
      'Tournament in active state',
      createDate(15, 9, 2023),
      createDate(20, 9, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.ACTIVE,
      'Valencia',
      16,
      createDate(10, 9, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 9, 2023),
      createDate(1, 9, 2023),
    );

    const completedTournament = new Tournament(
      completedTournamentId,
      'Completed Tournament',
      'Tournament in completed state',
      createDate(15, 10, 2023),
      createDate(20, 10, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.COMPLETED,
      'Seville',
      16,
      createDate(10, 10, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 10, 2023),
      createDate(1, 10, 2023),
    );

    const cancelledTournament = new Tournament(
      cancelledTournamentId,
      'Cancelled Tournament',
      'Tournament in cancelled state',
      createDate(15, 11, 2023),
      createDate(20, 11, 2023),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.CANCELLED,
      'Malaga',
      16,
      createDate(10, 11, 2023),
      PlayerLevel.P1,
      creatorUserId,
      createDate(1, 11, 2023),
      createDate(1, 11, 2023),
    );

    // Initialize repository with sample tournaments
    tournamentRepository = new MockTournamentRepository([
      draftTournament,
      openTournament,
      activeTournament,
      completedTournament,
      cancelledTournament,
    ]);

    // Create sample users
    const adminUser = new User(
      adminUserId,
      'admin@example.com',
      'password',
      'Admin User',
      UserRole.ADMIN,
      true,
      createDate(1, 1, 2023),
      createDate(1, 1, 2023),
    );

    const creatorUser = new User(
      creatorUserId,
      'creator@example.com',
      'password',
      'Creator User',
      UserRole.PLAYER,
      true,
      createDate(1, 1, 2023),
      createDate(1, 1, 2023),
    );

    const regularUser = new User(
      regularUserId,
      'regular@example.com',
      'password',
      'Regular User',
      UserRole.PLAYER,
      true,
      createDate(1, 1, 2023),
      createDate(1, 1, 2023),
    );

    // Initialize user repository with sample users
    userRepository = new MockUserRepository([adminUser, creatorUser, regularUser]);

    // Initialize use case
    useCase = new CompleteTournamentUseCase(tournamentRepository, userRepository);
  });

  it('should successfully complete an ACTIVE tournament by admin', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: activeTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.COMPLETED);
    expect(output.message).toContain('successfully');

    // Verify tournament is updated in repository
    const updatedTournament = await tournamentRepository.findById(activeTournamentId);
    expect(updatedTournament?.status).toBe(TournamentStatus.COMPLETED);
  });

  it('should successfully complete an ACTIVE tournament by creator', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: activeTournamentId,
      userId: creatorUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.COMPLETED);
    expect(output.message).toContain('successfully');

    // Verify tournament is updated in repository
    const updatedTournament = await tournamentRepository.findById(activeTournamentId);
    expect(updatedTournament?.status).toBe(TournamentStatus.COMPLETED);
  });

  it('should fail when regular user tries to complete a tournament', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: activeTournamentId,
      userId: regularUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only admins or the tournament creator');
  });

  it('should fail when trying to complete a DRAFT tournament', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: draftTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only active tournaments');
  });

  it('should fail when trying to complete an OPEN tournament', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: openTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only active tournaments');
  });

  it('should fail when trying to complete an already COMPLETED tournament', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: completedTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only active tournaments');
  });

  it('should fail when trying to complete a CANCELLED tournament', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: cancelledTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only active tournaments');
  });

  it('should fail when tournament does not exist', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: nonExistingTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('not found');
  });

  it('should fail when user does not exist', async () => {
    const input: CompleteTournamentInput = {
      tournamentId: activeTournamentId,
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
    } as CompleteTournamentInput;

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
  });
});
