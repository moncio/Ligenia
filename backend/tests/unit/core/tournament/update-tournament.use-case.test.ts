import {
  UpdateTournamentUseCase,
  UpdateTournamentInput,
} from '../../../../src/core/application/use-cases/tournament/update-tournament.use-case';
import { ITournamentRepository, PaginationOptions, TournamentFilter } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { Result } from '../../../../src/shared/result';

// Mock Tournament Repository
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

    return tournaments;
  }

  async count(filter?: TournamentFilter): Promise<number> {
    const tournaments = await this.findAll(filter);
    return tournaments.length;
  }

  async save(tournament: Tournament): Promise<void> {
    this.tournaments.set(tournament.id, tournament);
  }

  async update(tournament: Tournament): Promise<void> {
    this.tournaments.set(tournament.id, tournament);
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

    return result;
  }

  async countParticipantsByTournamentId(tournamentId: string): Promise<number> {
    return this.countParticipants(tournamentId);
  }
}

describe('UpdateTournamentUseCase', () => {
  let useCase: UpdateTournamentUseCase;
  let tournamentRepository: ITournamentRepository;
  let existingTournament: Tournament;

  beforeEach(() => {
    // Create an existing tournament for tests
    existingTournament = new Tournament(
      '12345678-1234-1234-1234-123456789012',
      'Existing Tournament',
      'An existing tournament description',
      new Date('2023-08-15T09:00:00Z'),
      new Date('2023-08-16T18:00:00Z'),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.DRAFT,
      'Madrid',
      16,
      new Date('2023-08-10T23:59:59Z'),
      PlayerLevel.P3,
      '00000000-0000-0000-0000-000000000001',
      new Date('2023-07-01T10:00:00Z'),
      new Date('2023-07-01T10:00:00Z'),
    );

    tournamentRepository = new MockTournamentRepository([existingTournament]);
    useCase = new UpdateTournamentUseCase(tournamentRepository);
  });

  it('should update a tournament successfully with full data', async () => {
    // Arrange
    const input = {
      id: existingTournament.id,
      name: 'Updated Tournament Name',
      description: 'Updated description',
      startDate: '2023-09-15T09:00:00Z',
      endDate: '2023-09-16T18:00:00Z',
      format: TournamentFormat.DOUBLE_ELIMINATION,
      status: TournamentStatus.OPEN,
      location: 'Barcelona',
      maxParticipants: 32,
      registrationDeadline: '2023-09-10T23:59:59Z',
      category: PlayerLevel.P3,
    };

    // Remember original values for comparison
    const origUpdatedAt = existingTournament.updatedAt;

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const tournament = result.getValue();
    expect(tournament.id).toBe(existingTournament.id);
    expect(tournament.name).toBe(input.name);
    expect(tournament.description).toBe(input.description);
    expect(tournament.format).toBe(input.format);
    expect(tournament.status).toBe(input.status);
    expect(tournament.location).toBe(input.location);
    expect(tournament.maxParticipants).toBe(input.maxParticipants);
    expect(tournament.category).toBe(input.category);
    expect(tournament.createdById).toBe(existingTournament.createdById);

    // Date conversions - check date equality without time precision
    expect(tournament.startDate.toDateString()).toBe(new Date(input.startDate).toDateString());
    expect(tournament.endDate?.toDateString()).toBe(new Date(input.endDate).toDateString());
    expect(tournament.registrationDeadline?.toDateString()).toBe(
      new Date(input.registrationDeadline).toDateString(),
    );
  });

  it('should update a tournament successfully with partial data', async () => {
    // Arrange
    const input = {
      id: existingTournament.id,
      name: 'Partially Updated Tournament',
      location: 'Valencia',
    };

    const originalStartDate = existingTournament.startDate;
    const originalEndDate = existingTournament.endDate;
    const originalFormat = existingTournament.format;

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const tournament = result.getValue();
    expect(tournament.id).toBe(existingTournament.id);
    expect(tournament.name).toBe(input.name);
    expect(tournament.location).toBe(input.location);

    // Verify unchanged fields remain the same
    expect(tournament.description).toBe(existingTournament.description);
    expect(tournament.startDate.toDateString()).toBe(originalStartDate.toDateString());
    expect(tournament.endDate?.toDateString()).toBe(originalEndDate?.toDateString());
    expect(tournament.format).toBe(originalFormat);
    expect(tournament.createdById).toBe(existingTournament.createdById);
  });

  it('should update a tournament successfully with null fields', async () => {
    // Arrange
    const input: {
      id: string;
      endDate: null;
      location: null;
      maxParticipants: null;
      registrationDeadline: null;
      category: null;
    } = {
      id: existingTournament.id,
      endDate: null,
      location: null,
      maxParticipants: null,
      registrationDeadline: null,
      category: null,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const tournament = result.getValue();
    expect(tournament.endDate).toBeNull();
    expect(tournament.location).toBeNull();
    expect(tournament.maxParticipants).toBeNull();
    expect(tournament.registrationDeadline).toBeNull();
    expect(tournament.category).toBeNull();
  });

  it('should fail when tournament not found', async () => {
    // Arrange
    const input = {
      id: '99999999-9999-9999-9999-999999999999',
      name: 'Non-existent Tournament',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Tournament with ID');
    expect(result.getError().message).toContain('not found');
  });

  it('should fail when end date is before start date', async () => {
    // Override the start date of the existing tournament to ensure test consistency
    existingTournament.startDate = new Date('2023-08-15T09:00:00Z');

    // Arrange
    const input = {
      id: existingTournament.id,
      endDate: '2023-08-14T18:00:00Z', // Before the original start date
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('End date must be after start date');
  });

  it('should fail when updating both dates with invalid range', async () => {
    // Arrange
    const input = {
      id: existingTournament.id,
      startDate: '2023-09-15T09:00:00Z',
      endDate: '2023-09-14T18:00:00Z', // Before the new start date
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('End date must be after start date');
  });

  it('should fail when registration deadline is after start date', async () => {
    // Override the start date of the existing tournament to ensure test consistency
    existingTournament.startDate = new Date('2023-08-15T09:00:00Z');

    // Arrange
    const input = {
      id: existingTournament.id,
      registrationDeadline: '2023-08-16T00:00:00Z', // After the original start date
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Registration deadline must be before start date');
  });

  it('should fail when updating both start date and registration deadline with invalid range', async () => {
    // Arrange
    const input = {
      id: existingTournament.id,
      startDate: '2023-09-15T09:00:00Z',
      registrationDeadline: '2023-09-16T00:00:00Z', // After the new start date
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Registration deadline must be before start date');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const input = {
      id: existingTournament.id,
      name: 'AB', // Less than 3 characters
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('String must contain at least 3 character');
  });
});
