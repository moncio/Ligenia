import { RegisterToTournamentUseCase } from '../../../../src/core/application/use-cases/tournament/register-to-tournament.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { Tournament, TournamentFormat, TournamentStatus, PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { Result } from '../../../../src/shared/result';

// Mock for Tournament Repository
class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Tournament[] = [];
  private participantRegistrations: Map<string, Set<string>> = new Map();

  constructor(initialTournaments: Tournament[] = []) {
    this.tournaments = initialTournaments;
    // Initialize empty participant sets for each tournament
    this.tournaments.forEach(tournament => {
      this.participantRegistrations.set(tournament.id, new Set<string>());
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(t => t.id === id) || null;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async save(tournament: Tournament): Promise<void> {
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

  async getParticipants(tournamentId: string): Promise<string[]> {
    const participants = this.participantRegistrations.get(tournamentId);
    return participants ? Array.from(participants) : [];
  }
}

// Mock for User Repository
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
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
}

describe('RegisterToTournamentUseCase', () => {
  let useCase: RegisterToTournamentUseCase;
  let tournamentRepository: ITournamentRepository;
  let userRepository: IUserRepository;
  let openTournament: Tournament;
  let closedTournament: Tournament;
  let fullTournament: Tournament;
  let expiredTournament: Tournament;
  let playerUser: User;
  let adminUser: User;

  beforeEach(() => {
    // Create test tournaments
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    openTournament = new Tournament(
      '12345678-1234-1234-1234-123456789001',
      'Open Tournament',
      'A tournament open for registration',
      tomorrow, // Starts tomorrow
      null,
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN,
      'Madrid',
      16, // Max 16 participants
      tomorrow, // Registration deadline is tomorrow
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      now,
      now
    );

    closedTournament = new Tournament(
      '12345678-1234-1234-1234-123456789002',
      'Closed Tournament',
      'A tournament not open for registration',
      tomorrow,
      null,
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT, // Not OPEN
      'Madrid',
      16,
      tomorrow,
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      now,
      now
    );

    fullTournament = new Tournament(
      '12345678-1234-1234-1234-123456789003',
      'Full Tournament',
      'A tournament with max participants',
      tomorrow,
      null,
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN,
      'Madrid',
      1, // Max 1 participant
      tomorrow,
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      now,
      now
    );

    expiredTournament = new Tournament(
      '12345678-1234-1234-1234-123456789004',
      'Expired Tournament',
      'A tournament with passed registration deadline',
      tomorrow,
      null,
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN,
      'Madrid',
      16,
      yesterday, // Registration deadline was yesterday
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      now,
      now
    );

    // Create test users
    playerUser = new User(
      '00000000-0000-0000-0000-000000000011',
      'player@test.com',
      'password',
      'Player User',
      UserRole.PLAYER,
      true,
      now,
      now
    );

    adminUser = new User(
      '00000000-0000-0000-0000-000000000012',
      'admin@test.com',
      'password',
      'Admin User',
      UserRole.ADMIN,
      true,
      now,
      now
    );

    // Setup repositories
    tournamentRepository = new MockTournamentRepository([
      openTournament,
      closedTournament,
      fullTournament,
      expiredTournament
    ]);
    userRepository = new MockUserRepository([playerUser, adminUser]);

    // Pre-register a player to the full tournament
    (tournamentRepository as MockTournamentRepository).registerParticipant(
      fullTournament.id,
      '00000000-0000-0000-0000-000000000099' // Another user ID
    );

    // Setup use case
    useCase = new RegisterToTournamentUseCase(tournamentRepository, userRepository);
  });

  it('should register a player to a tournament successfully', async () => {
    // Arrange
    const input = {
      tournamentId: openTournament.id,
      userId: playerUser.id
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    const isRegistered = await tournamentRepository.isParticipantRegistered(input.tournamentId, input.userId);
    expect(isRegistered).toBe(true);
  });

  it('should fail when tournament does not exist', async () => {
    // Arrange
    const input = {
      tournamentId: '99999999-9999-9999-9999-999999999999', // Non-existent tournament
      userId: playerUser.id
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Tournament with ID');
    expect(result.getError().message).toContain('not found');
  });

  it('should fail when user does not exist', async () => {
    // Arrange
    const input = {
      tournamentId: openTournament.id,
      userId: '99999999-9999-9999-9999-999999999999' // Non-existent user
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('User with ID');
    expect(result.getError().message).toContain('not found');
  });

  it('should fail when user is not a player', async () => {
    // Arrange
    const input = {
      tournamentId: openTournament.id,
      userId: adminUser.id // Admin user, not a player
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Only users with PLAYER role');
  });

  it('should fail when user is already registered', async () => {
    // Arrange
    const input = {
      tournamentId: openTournament.id,
      userId: playerUser.id
    };

    // Register the player first
    await tournamentRepository.registerParticipant(input.tournamentId, input.userId);

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('already registered');
  });

  it('should fail when tournament is not in OPEN status', async () => {
    // Arrange
    const input = {
      tournamentId: closedTournament.id,
      userId: playerUser.id
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Cannot register for tournament with status');
  });

  it('should fail when registration deadline has passed', async () => {
    // Arrange
    const input = {
      tournamentId: expiredTournament.id,
      userId: playerUser.id
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('deadline has passed');
  });

  it('should fail when tournament is full', async () => {
    // Arrange
    const input = {
      tournamentId: fullTournament.id,
      userId: playerUser.id
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('maximum participants');
  });
}); 