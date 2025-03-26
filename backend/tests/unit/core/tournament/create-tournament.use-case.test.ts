import {
  CreateTournamentUseCase,
  CreateTournamentInput,
} from '../../../../src/core/application/use-cases/tournament/create-tournament.use-case';
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

describe('CreateTournamentUseCase', () => {
  let useCase: CreateTournamentUseCase;
  let tournamentRepository: ITournamentRepository;

  beforeEach(() => {
    tournamentRepository = new MockTournamentRepository();
    useCase = new CreateTournamentUseCase(tournamentRepository);
  });

  it('should create a tournament successfully', async () => {
    // Arrange
    const input = {
      name: 'Summer Tournament 2023',
      description: 'A great summer tournament',
      startDate: '2023-07-15T09:00:00Z',
      endDate: '2023-07-16T18:00:00Z',
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      location: 'Madrid',
      maxParticipants: 16,
      registrationDeadline: '2023-07-10T23:59:59Z',
      category: PlayerLevel.P3,
      createdById: '00000000-0000-0000-0000-000000000001',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const tournament = result.getValue();
    expect(tournament.id).toBeDefined();
    expect(tournament.name).toBe(input.name);
    expect(tournament.description).toBe(input.description);
    expect(tournament.format).toBe(input.format);
    expect(tournament.status).toBe(input.status);
    expect(tournament.location).toBe(input.location);
    expect(tournament.maxParticipants).toBe(input.maxParticipants);
    expect(tournament.category).toBe(input.category);
    expect(tournament.createdById).toBe(input.createdById);

    // Date conversions
    expect(tournament.startDate).toEqual(new Date(input.startDate));
    expect(tournament.endDate).toEqual(new Date(input.endDate));
    expect(tournament.registrationDeadline).toEqual(new Date(input.registrationDeadline));
  });

  it('should fail when end date is before start date', async () => {
    // Arrange
    const input = {
      name: 'Invalid Tournament',
      description: 'Tournament with invalid dates',
      startDate: '2023-07-15T09:00:00Z',
      endDate: '2023-07-14T18:00:00Z', // End date before start date
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      createdById: '00000000-0000-0000-0000-000000000001',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('End date must be after start date');
  });

  it('should fail when registration deadline is after start date', async () => {
    // Arrange
    const input = {
      name: 'Invalid Tournament',
      description: 'Tournament with invalid registration deadline',
      startDate: '2023-07-15T09:00:00Z',
      endDate: '2023-07-16T18:00:00Z',
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      registrationDeadline: '2023-07-16T00:00:00Z', // After start date
      createdById: '00000000-0000-0000-0000-000000000001',
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
      name: 'T', // Less than 3 characters
      startDate: '2023-07-15T09:00:00Z',
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      createdById: '00000000-0000-0000-0000-000000000001',
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('String must contain at least 3 character');
  });

  it('should create a tournament with minimum required fields', async () => {
    // Arrange
    const input = {
      name: 'Minimalist Tournament',
      startDate: '2023-07-15T09:00:00Z',
      format: TournamentFormat.SINGLE_ELIMINATION,
      createdById: '00000000-0000-0000-0000-000000000001',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const tournament = result.getValue();
    expect(tournament.id).toBeDefined();
    expect(tournament.name).toBe(input.name);
    expect(tournament.description).toBe(''); // Default value
    expect(tournament.format).toBe(input.format);
    expect(tournament.status).toBe(TournamentStatus.DRAFT); // Default value

    // Optional fields should be null
    expect(tournament.location).toBe(null);
    expect(tournament.maxParticipants).toBe(null);
    expect(tournament.endDate).toBe(null);
    expect(tournament.registrationDeadline).toBe(null);
    expect(tournament.category).toBe(null);
  });
});
