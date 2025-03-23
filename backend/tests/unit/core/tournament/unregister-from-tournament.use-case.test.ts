import { UnregisterFromTournamentUseCase } from '../../../../src/core/application/use-cases/tournament/unregister-from-tournament.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
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

describe('UnregisterFromTournamentUseCase', () => {
  let useCase: UnregisterFromTournamentUseCase;
  let tournamentRepository: ITournamentRepository;
  let openTournament: Tournament;
  let startedTournament: Tournament;
  let closedTournament: Tournament;
  const userId = '00000000-0000-0000-0000-000000000011';

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
      16,
      tomorrow,
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      now,
      now,
    );

    startedTournament = new Tournament(
      '12345678-1234-1234-1234-123456789002',
      'Started Tournament',
      'A tournament that has already started',
      yesterday, // Started yesterday
      null,
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.ACTIVE,
      'Madrid',
      16,
      yesterday,
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      now,
      now,
    );

    closedTournament = new Tournament(
      '12345678-1234-1234-1234-123456789003',
      'Closed Tournament',
      'A tournament closed for registration',
      tomorrow,
      null,
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Madrid',
      16,
      tomorrow,
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      now,
      now,
    );

    // Setup repository with test tournaments
    tournamentRepository = new MockTournamentRepository([
      openTournament,
      startedTournament,
      closedTournament,
    ]);

    // Register user to all tournaments for testing
    [openTournament, startedTournament, closedTournament].forEach(tournament => {
      (tournamentRepository as MockTournamentRepository).registerParticipant(tournament.id, userId);
    });

    // Setup use case
    useCase = new UnregisterFromTournamentUseCase(tournamentRepository);
  });

  it('should unregister a player from a tournament successfully', async () => {
    // Arrange
    const input = {
      tournamentId: openTournament.id,
      userId: userId,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    const isRegistered = await tournamentRepository.isParticipantRegistered(
      input.tournamentId,
      input.userId,
    );
    expect(isRegistered).toBe(false);
  });

  it('should fail when tournament does not exist', async () => {
    // Arrange
    const input = {
      tournamentId: '99999999-9999-9999-9999-999999999999', // Non-existent tournament
      userId: userId,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Tournament with ID');
    expect(result.getError().message).toContain('not found');
  });

  it('should fail when user is not registered', async () => {
    // Arrange
    const input = {
      tournamentId: openTournament.id,
      userId: '99999999-9999-9999-9999-999999999999', // Non-registered user
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('not registered');
  });

  it('should fail when tournament is not in OPEN or DRAFT status', async () => {
    // Arrange
    const input = {
      tournamentId: startedTournament.id,
      userId: userId,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Cannot unregister from tournament with status');
  });

  it('should fail when tournament has already started', async () => {
    // Arrange - We'll use a tournament that's in OPEN status but has started
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const pastTournament = new Tournament(
      '12345678-1234-1234-1234-123456789004',
      'Past Tournament',
      'A tournament that has started but still OPEN',
      yesterday, // Started yesterday
      null,
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.OPEN, // Still OPEN for some reason
      'Madrid',
      16,
      yesterday,
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      new Date(),
      new Date(),
    );

    await tournamentRepository.save(pastTournament);
    await tournamentRepository.registerParticipant(pastTournament.id, userId);

    const input = {
      tournamentId: pastTournament.id,
      userId: userId,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Cannot unregister after tournament has started');
  });

  it('should allow unregistration from a DRAFT tournament', async () => {
    // Arrange
    const input = {
      tournamentId: closedTournament.id,
      userId: userId,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    const isRegistered = await tournamentRepository.isParticipantRegistered(
      input.tournamentId,
      input.userId,
    );
    expect(isRegistered).toBe(false);
  });
});
