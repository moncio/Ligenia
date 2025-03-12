// Define enums locally instead of importing from @prisma/client
enum TournamentFormat {
  SINGLE_ELIMINATION = 'SINGLE_ELIMINATION',
  DOUBLE_ELIMINATION = 'DOUBLE_ELIMINATION',
  ROUND_ROBIN = 'ROUND_ROBIN',
  SWISS = 'SWISS'
}

enum TournamentStatus {
  DRAFT = 'DRAFT',
  REGISTRATION = 'REGISTRATION',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

import { CreateTournamentUseCase } from '../../../../../src/core/use-cases/tournament/create-tournament.use-case';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { CreateTournamentDto } from '../../../../../src/core/domain/dtos/create-tournament.dto';
import { ILeagueRepository } from '../../../../../src/core/domain/interfaces/league-repository.interface';
import { League } from '../../../../../src/core/domain/entities/league.entity';

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

// Mock del repositorio de ligas
class MockLeagueRepository implements ILeagueRepository {
  leagues: League[] = [];

  async findById(id: string): Promise<League | null> {
    return this.leagues.find(league => league.id === id) || null;
  }

  async findAll(): Promise<League[]> {
    return this.leagues;
  }

  async findAllPaginated(): Promise<any> {
    return {
      data: this.leagues,
      pagination: {
        total: this.leagues.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    };
  }

  async create(data: Omit<League, 'id'>): Promise<League> {
    const league = new League({
      id: `league-${this.leagues.length + 1}`,
      ...data,
    });
    this.leagues.push(league);
    return league;
  }

  async update(): Promise<League | null> {
    return null;
  }

  async delete(): Promise<boolean> {
    return true;
  }

  async findByName(): Promise<League[]> {
    return [];
  }

  async findByAdmin(): Promise<League[]> {
    return [];
  }

  async existsByName(): Promise<boolean> {
    return false;
  }
}

describe('CreateTournamentUseCase', () => {
  let tournamentRepository: MockTournamentRepository;
  let leagueRepository: MockLeagueRepository;
  let createTournamentUseCase: CreateTournamentUseCase;
  const validLeagueId = '123e4567-e89b-12d3-a456-426614174000';

  beforeEach(() => {
    tournamentRepository = new MockTournamentRepository();
    leagueRepository = new MockLeagueRepository();
    createTournamentUseCase = new CreateTournamentUseCase(tournamentRepository, leagueRepository);

    // Crear una liga válida para las pruebas
    leagueRepository.leagues.push(new League({
      id: validLeagueId,
      name: 'Test League',
      adminId: '123e4567-e89b-12d3-a456-426614174001',
      scoringType: 'STANDARD',
      isPublic: true,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('should create a new tournament with valid data', async () => {
    // Arrange
    const tournamentData: CreateTournamentDto = {
      name: 'Torneo de Prueba',
      leagueId: validLeagueId,
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      description: 'Torneo de prueba para la liga',
      maxParticipants: 16,
      minParticipants: 8,
      registrationDeadline: new Date('2024-11-30'),
    };

    // Act
    const result = await createTournamentUseCase.execute(tournamentData);

    // Assert
    expect(result.isSuccess).toBe(true);
    const tournament = result.getValue();
    expect(tournament.name).toBe(tournamentData.name);
    expect(tournament.leagueId).toBe(tournamentData.leagueId);
    expect(tournament.format).toBe(tournamentData.format);
    expect(tournament.status).toBe(tournamentData.status);
    expect(tournamentRepository.tournaments.length).toBe(1);
  });

  it('should fail if the league does not exist', async () => {
    // Arrange
    const tournamentData: CreateTournamentDto = {
      name: 'Torneo de Prueba',
      leagueId: '123e4567-e89b-12d3-a456-999999999999',
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      startDate: new Date('2024-12-01'),
    };

    // Act
    const result = await createTournamentUseCase.execute(tournamentData);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('La liga especificada no existe');
    expect(tournamentRepository.tournaments.length).toBe(0);
  });

  it('should fail if a tournament with the same name already exists in the league', async () => {
    // Arrange
    const tournamentData: CreateTournamentDto = {
      name: 'Torneo de Prueba',
      leagueId: validLeagueId,
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      startDate: new Date('2024-12-01'),
    };

    // Create a tournament first
    await createTournamentUseCase.execute(tournamentData);

    // Try to create another tournament with the same name in the same league
    const result = await createTournamentUseCase.execute(tournamentData);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Ya existe un torneo con el nombre');
    expect(tournamentRepository.tournaments.length).toBe(1);
  });

  it('should create a tournament with minimum required fields', async () => {
    // Arrange
    const tournamentData: CreateTournamentDto = {
      name: 'Torneo Mínimo',
      leagueId: validLeagueId,
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: TournamentStatus.DRAFT,
      startDate: new Date('2024-12-01'),
    };

    // Act
    const result = await createTournamentUseCase.execute(tournamentData);

    // Assert
    expect(result.isSuccess).toBe(true);
    const tournament = result.getValue();
    expect(tournament.name).toBe(tournamentData.name);
    expect(tournament.status).toBe(TournamentStatus.DRAFT);
    expect(tournament.description).toBeUndefined();
    expect(tournament.maxParticipants).toBeUndefined();
    expect(tournament.minParticipants).toBeUndefined();
    expect(tournament.registrationDeadline).toBeUndefined();
  });
}); 