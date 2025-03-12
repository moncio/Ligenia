import { TournamentFormat, TournamentStatus } from '@prisma/client';
import { GetTournamentByIdUseCase } from '../../../../../src/core/use-cases/tournament/get-tournament-by-id.use-case';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';

// Define enums locally to avoid dependency issues
enum LocalTournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS = 'SWISS'
}

enum LocalTournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION = 'REGISTRATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Mock del repositorio de torneos
class MockTournamentRepository implements ITournamentRepository {
  tournaments: Tournament[] = [];

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(tournament => tournament.id === id) || null;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async findAllPaginated(options: any): Promise<any> {
    return {
      data: this.tournaments,
      pagination: {
        total: this.tournaments.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }

  async create(data: Omit<Tournament, 'id'>): Promise<Tournament> {
    const tournament = new Tournament({
      id: `tournament-${this.tournaments.length + 1}`,
      ...data,
    });
    this.tournaments.push(tournament);
    return tournament;
  }

  async update(id: string, data: Partial<Tournament>): Promise<Tournament | null> {
    const index = this.tournaments.findIndex(tournament => tournament.id === id);
    if (index === -1) return null;
    
    const updatedTournament = { ...this.tournaments[index], ...data };
    this.tournaments[index] = updatedTournament as Tournament;
    return updatedTournament as Tournament;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.tournaments.length;
    this.tournaments = this.tournaments.filter(tournament => tournament.id !== id);
    return initialLength > this.tournaments.length;
  }

  async findByLeague(leagueId: string): Promise<Tournament[]> {
    return this.tournaments.filter(tournament => tournament.leagueId === leagueId);
  }

  async existsByNameInLeague(name: string, leagueId: string): Promise<boolean> {
    return this.tournaments.some(
      tournament => 
        tournament.name.toLowerCase() === name.toLowerCase() && 
        tournament.leagueId === leagueId
    );
  }
}

describe('GetTournamentByIdUseCase', () => {
  let tournamentRepository: MockTournamentRepository;
  let getTournamentByIdUseCase: GetTournamentByIdUseCase;
  const validTournamentId = 'tournament-1';

  beforeEach(() => {
    tournamentRepository = new MockTournamentRepository();
    getTournamentByIdUseCase = new GetTournamentByIdUseCase(tournamentRepository);

    // Crear un torneo válido para las pruebas
    tournamentRepository.tournaments.push(new Tournament({
      id: validTournamentId,
      name: 'Test Tournament',
      leagueId: '123e4567-e89b-12d3-a456-426614174000',
      format: LocalTournamentFormat.SINGLE_ELIMINATION as TournamentFormat,
      status: LocalTournamentStatus.DRAFT as TournamentStatus,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      description: 'Test tournament description',
      maxParticipants: 16,
      minParticipants: 8,
      registrationDeadline: new Date('2024-11-30'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('should return a tournament when a valid ID is provided', async () => {
    // Act
    const result = await getTournamentByIdUseCase.execute(validTournamentId);

    // Assert
    expect(result.isSuccess).toBe(true);
    const tournament = result.getValue();
    expect(tournament.id).toBe(validTournamentId);
    expect(tournament.name).toBe('Test Tournament');
    expect(tournament.format).toBe(LocalTournamentFormat.SINGLE_ELIMINATION);
  });

  it('should fail when an invalid ID is provided', async () => {
    // Act
    const result = await getTournamentByIdUseCase.execute('non-existent-id');

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('El torneo no existe');
  });
}); 