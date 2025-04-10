import {
  CancelTournamentUseCase,
  CancelTournamentInput,
} from '../../../../src/core/application/use-cases/tournament/cancel-tournament.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { PaginationOptions } from '../../../../src/core/application/interfaces/repositories/tournament.repository';

// Mock Tournament Repository
class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Map<string, Tournament> = new Map();

  constructor(initialTournaments: Tournament[] = []) {
    initialTournaments.forEach(tournament => {
      this.tournaments.set(tournament.id, tournament);
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.get(id) || null;
  }

  async findAll(): Promise<Tournament[]> {
    return Array.from(this.tournaments.values());
  }

  async count(): Promise<number> {
    return this.tournaments.size;
  }

  async save(tournament: Tournament): Promise<void> {
    this.tournaments.set(tournament.id, tournament);
  }

  async update(tournament: Tournament): Promise<void> {
    if (this.tournaments.has(tournament.id)) {
      this.tournaments.set(tournament.id, tournament);
    }
  }

  async delete(id: string): Promise<void> {
    this.tournaments.delete(id);
  }

  async countParticipants(): Promise<number> {
    return 0;
  }

  async registerParticipant(): Promise<void> {}

  async unregisterParticipant(): Promise<void> {}

  async isParticipantRegistered(): Promise<boolean> {
    return false;
  }

  async getParticipants(): Promise<string[]> {
    return [];
  }

  async countParticipantsByTournamentId(): Promise<number> {
    return 0;
  }
}

// Mock User Repository
class MockUserRepository implements IUserRepository {
  private users: Map<string, User>;

  constructor(users: User[]) {
    this.users = new Map(users.map(user => [user.id, user]));
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values()).find(user => user.email === email) || null;
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    const users = Array.from(this.users.values());
    if (offset !== undefined && limit !== undefined) {
      return users.slice(offset, offset + limit);
    }
    return users;
  }

  async count(): Promise<number> {
    return this.users.size;
  }

  async save(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async update(user: User): Promise<void> {
    this.users.set(user.id, user);
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

describe('CancelTournamentUseCase', () => {
  let useCase: CancelTournamentUseCase;
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
  const organizerUserId = '222e4567-e89b-12d3-a456-426614174000';
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
      organizerUserId,
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
      organizerUserId,
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
      organizerUserId,
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
      organizerUserId,
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
      organizerUserId,
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

    const organizerUser = new User(
      organizerUserId,
      'organizer@example.com',
      'password',
      'Organizer User',
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
    userRepository = new MockUserRepository([adminUser, organizerUser, regularUser]);

    // Initialize use case
    useCase = new CancelTournamentUseCase(tournamentRepository, userRepository);
  });

  it('should successfully cancel a DRAFT tournament by admin', async () => {
    const input: CancelTournamentInput = {
      tournamentId: draftTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.CANCELLED);
    expect(output.message).toContain('successfully');

    // Verify tournament is updated in repository
    const updatedTournament = await tournamentRepository.findById(draftTournamentId);
    expect(updatedTournament?.status).toBe(TournamentStatus.CANCELLED);
  });

  it('should successfully cancel an OPEN tournament by organizer', async () => {
    const input: CancelTournamentInput = {
      tournamentId: openTournamentId,
      userId: organizerUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.tournament.status).toBe(TournamentStatus.CANCELLED);
    expect(output.message).toContain('successfully');

    // Verify tournament is updated in repository
    const updatedTournament = await tournamentRepository.findById(openTournamentId);
    expect(updatedTournament?.status).toBe(TournamentStatus.CANCELLED);
  });

  it('should fail when regular user tries to cancel a tournament', async () => {
    const input: CancelTournamentInput = {
      tournamentId: draftTournamentId,
      userId: regularUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Only admins or the tournament organizer');
  });

  it('should fail when trying to cancel an ACTIVE tournament', async () => {
    const input: CancelTournamentInput = {
      tournamentId: activeTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Cannot cancel an active tournament');
  });

  it('should fail when trying to cancel a COMPLETED tournament', async () => {
    const input: CancelTournamentInput = {
      tournamentId: completedTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Cannot cancel a completed tournament');
  });

  it('should fail when trying to cancel an already CANCELLED tournament', async () => {
    const input: CancelTournamentInput = {
      tournamentId: cancelledTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('already cancelled');
  });

  it('should fail when tournament does not exist', async () => {
    const input: CancelTournamentInput = {
      tournamentId: nonExistingTournamentId,
      userId: adminUserId,
    };

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('not found');
  });

  it('should fail when user does not exist', async () => {
    const input: CancelTournamentInput = {
      tournamentId: draftTournamentId,
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
    } as CancelTournamentInput;

    const result = await useCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
  });
});
