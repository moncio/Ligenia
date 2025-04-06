import { UnregisterFromTournamentUseCase } from '../../../../src/core/application/use-cases/tournament/unregister-from-tournament.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { Result } from '../../../../src/shared/result';
import { TournamentFilter, PaginationOptions } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock for Tournament Repository
class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Map<string, Tournament> = new Map();
  private participantRegistrations: Map<string, Set<string>> = new Map();

  constructor(initialTournaments: Tournament[] = []) {
    initialTournaments.forEach(tournament => {
      this.tournaments.set(tournament.id, tournament);
      this.participantRegistrations.set(tournament.id, new Set<string>());
    });
  }

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.get(id) || null;
  }

  async findAll(filter?: TournamentFilter, pagination?: PaginationOptions): Promise<Tournament[]> {
    let tournaments = Array.from(this.tournaments.values());

    if (filter) {
      if (filter.status) {
        tournaments = tournaments.filter(t => t.status === filter.status);
      }
      if (filter.category) {
        tournaments = tournaments.filter(t => t.category === filter.category);
      }
      if (filter.dateRange) {
        if (filter.dateRange.from) {
          tournaments = tournaments.filter(t => t.startDate >= filter.dateRange!.from!);
        }
        if (filter.dateRange.to) {
          tournaments = tournaments.filter(t => t.endDate <= filter.dateRange!.to!);
        }
      }
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        tournaments = tournaments.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
        );
      }
    }

    if (pagination) {
      tournaments = tournaments.slice(
        pagination.skip || 0,
        (pagination.skip || 0) + (pagination.limit || tournaments.length)
      );
    }

    return tournaments;
  }

  async count(filter?: TournamentFilter): Promise<number> {
    let tournaments = Array.from(this.tournaments.values());

    if (filter) {
      if (filter.status) {
        tournaments = tournaments.filter(t => t.status === filter.status);
      }
      if (filter.category) {
        tournaments = tournaments.filter(t => t.category === filter.category);
      }
      if (filter.dateRange) {
        if (filter.dateRange.from) {
          tournaments = tournaments.filter(t => t.startDate >= filter.dateRange!.from!);
        }
        if (filter.dateRange.to) {
          tournaments = tournaments.filter(t => t.endDate <= filter.dateRange!.to!);
        }
      }
      if (filter.searchTerm) {
        const searchLower = filter.searchTerm.toLowerCase();
        tournaments = tournaments.filter(t => 
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower)
        );
      }
    }

    return tournaments.length;
  }

  async save(tournament: Tournament): Promise<void> {
    this.tournaments.set(tournament.id, tournament);
    if (!this.participantRegistrations.has(tournament.id)) {
      this.participantRegistrations.set(tournament.id, new Set<string>());
    }
  }

  async update(tournament: Tournament): Promise<void> {
    if (this.tournaments.has(tournament.id)) {
      this.tournaments.set(tournament.id, tournament);
    }
  }

  async delete(id: string): Promise<void> {
    this.tournaments.delete(id);
    this.participantRegistrations.delete(id);
  }

  async countParticipants(tournamentId: string): Promise<number> {
    return this.participantRegistrations.get(tournamentId)?.size || 0;
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
    return participants?.has(playerId) || false;
  }

  async getParticipants(tournamentId: string, pagination?: PaginationOptions): Promise<string[]> {
    const participants = Array.from(this.participantRegistrations.get(tournamentId) || []);
    if (pagination) {
      return participants.slice(
        pagination.skip || 0,
        (pagination.skip || 0) + (pagination.limit || participants.length)
      );
    }
    return participants;
  }

  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    return this.countParticipants(tournamentId);
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
      TournamentStatus.DRAFT,
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
    expect(result.isSuccess()).toBe(true);
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
    expect(result.isFailure()).toBe(true);
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
    expect(result.isFailure()).toBe(true);
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
    expect(result.isFailure()).toBe(true);
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
      TournamentStatus.DRAFT, // Still OPEN for some reason
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
    expect(result.isFailure()).toBe(true);
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
    expect(result.isSuccess()).toBe(true);
    const isRegistered = await tournamentRepository.isParticipantRegistered(
      input.tournamentId,
      input.userId,
    );
    expect(isRegistered).toBe(false);
  });
});
