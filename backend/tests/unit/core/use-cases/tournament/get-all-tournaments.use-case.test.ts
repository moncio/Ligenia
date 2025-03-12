import { TournamentFormat, TournamentStatus } from '@prisma/client';
import { GetAllTournamentsUseCase, GetAllTournamentsInput } from '../../../../../src/core/use-cases/tournament/get-all-tournaments.use-case';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { PaginationOptions } from '../../../../../src/core/domain/interfaces/repository.interface';

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

  async findAllPaginated(pagination: PaginationOptions = { page: 1, limit: 10 }): Promise<any> {
    const { page = 1, limit = 10 } = pagination;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = this.tournaments.slice(startIndex, endIndex);
    
    return {
      data: paginatedData,
      pagination: {
        total: this.tournaments.length,
        page,
        limit,
        totalPages: Math.ceil(this.tournaments.length / limit),
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
    
    const updatedTournament = { ...this.tournaments[index], ...data, updatedAt: new Date() };
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

describe('GetAllTournamentsUseCase', () => {
  let tournamentRepository: MockTournamentRepository;
  let getAllTournamentsUseCase: GetAllTournamentsUseCase;
  const validLeagueId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    tournamentRepository = new MockTournamentRepository();
    getAllTournamentsUseCase = new GetAllTournamentsUseCase(tournamentRepository);

    // Crear 15 torneos de prueba
    for (let i = 1; i <= 15; i++) {
      const leagueId = i <= 10 ? validLeagueId : 'another-league-id';
      tournamentRepository.tournaments.push(new Tournament({
        id: `tournament-${i}`,
        name: `Test Tournament ${i}`,
        leagueId,
        format: LocalTournamentFormat.SINGLE_ELIMINATION as TournamentFormat,
        status: LocalTournamentStatus.DRAFT as TournamentStatus,
        startDate: new Date('2024-12-01'),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
  });

  it('should return all tournaments with default pagination', async () => {
    // Act
    const result = await getAllTournamentsUseCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    const { data, pagination } = result.getValue();
    expect(data.length).toBe(10); // Default limit is 10
    expect(pagination.page).toBe(1);
    expect(pagination.limit).toBe(10);
    expect(pagination.total).toBe(15);
    expect(pagination.totalPages).toBe(2);
  });

  it('should return tournaments with custom pagination', async () => {
    // Act
    const result = await getAllTournamentsUseCase.execute({ 
      pagination: { page: 2, limit: 5 } 
    });

    // Assert
    expect(result.isSuccess).toBe(true);
    const { data, pagination } = result.getValue();
    expect(data.length).toBe(5);
    expect(pagination.page).toBe(2);
    expect(pagination.limit).toBe(5);
    expect(pagination.total).toBe(15);
    expect(pagination.totalPages).toBe(3);
  });

  it('should return empty array when no tournaments exist', async () => {
    // Arrange
    tournamentRepository.tournaments = [];

    // Act
    const result = await getAllTournamentsUseCase.execute();

    // Assert
    expect(result.isSuccess).toBe(true);
    const { data, pagination } = result.getValue();
    expect(data.length).toBe(0);
    expect(pagination.total).toBe(0);
    expect(pagination.totalPages).toBe(0);
  });

  it('should filter tournaments by leagueId', async () => {
    // Act
    const leagueId = validLeagueId;
    const result = await getAllTournamentsUseCase.execute({ leagueId });

    // Assert
    expect(result.isSuccess).toBe(true);
    const { data, pagination } = result.getValue();
    expect(data.length).toBe(10);
    expect(pagination.total).toBe(10);
    expect(data.every((tournament: Tournament) => tournament.leagueId === leagueId)).toBe(true);
  });
}); 