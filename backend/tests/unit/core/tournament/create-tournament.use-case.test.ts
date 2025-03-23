import { CreateTournamentUseCase } from '../../../../src/core/application/use-cases/tournament/create-tournament.use-case';
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

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(t => t.id === id) || null;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async save(tournament: Tournament): Promise<void> {
    // Simulate ID generation
    tournament.id = `tournament-${this.tournaments.length + 1}`;
    this.tournaments.push(tournament);
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
    }
  }

  async countParticipants(tournamentId: string): Promise<number> {
    return 0;
  }

  async registerParticipant(tournamentId: string, playerId: string): Promise<void> {
    // Implementation not needed for this test
  }

  async unregisterParticipant(tournamentId: string, playerId: string): Promise<void> {
    // Implementation not needed for this test
  }

  async isParticipantRegistered(tournamentId: string, playerId: string): Promise<boolean> {
    return false;
  }

  async getParticipants(tournamentId: string): Promise<string[]> {
    return [];
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
    expect(result.isSuccess).toBe(true);

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
    expect(result.isFailure).toBe(true);
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
    expect(result.isFailure).toBe(true);
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
    expect(result.isFailure).toBe(true);
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
    expect(result.isSuccess).toBe(true);

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
