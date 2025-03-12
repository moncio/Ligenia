import { DeleteLeagueUseCase } from '../../../../../src/core/use-cases/league/delete-league.use-case';
import { ILeagueRepository } from '../../../../../src/core/domain/interfaces/league-repository.interface';
import { League } from '../../../../../src/core/domain/entities/league.entity';
import { ScoringType } from '@prisma/client';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';

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

  async update(id: string, data: Partial<League>): Promise<League | null> {
    const index = this.leagues.findIndex(league => league.id === id);
    if (index === -1) return null;
    
    const updatedLeague = { ...this.leagues[index], ...data };
    this.leagues[index] = updatedLeague as League;
    return updatedLeague as League;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.leagues.length;
    this.leagues = this.leagues.filter(league => league.id !== id);
    return initialLength > this.leagues.length;
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

// Mock del repositorio de torneos
class MockTournamentRepository implements ITournamentRepository {
  tournaments: Tournament[] = [];

  async findById(): Promise<Tournament | null> {
    return null;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async findAllPaginated(): Promise<any> {
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

  async create(): Promise<Tournament> {
    return {} as Tournament;
  }

  async update(): Promise<Tournament | null> {
    return null;
  }

  async delete(): Promise<boolean> {
    return true;
  }

  async findByLeague(leagueId: string): Promise<Tournament[]> {
    return this.tournaments.filter(tournament => tournament.leagueId === leagueId);
  }

  async existsByNameInLeague(): Promise<boolean> {
    return false;
  }
}

describe('DeleteLeagueUseCase', () => {
  let leagueRepository: MockLeagueRepository;
  let tournamentRepository: MockTournamentRepository;
  let deleteLeagueUseCase: DeleteLeagueUseCase;
  const validLeagueId = 'league-1';

  beforeEach(() => {
    leagueRepository = new MockLeagueRepository();
    tournamentRepository = new MockTournamentRepository();
    deleteLeagueUseCase = new DeleteLeagueUseCase(leagueRepository, tournamentRepository);

    // Crear una liga válida para las pruebas
    leagueRepository.leagues.push(new League({
      id: validLeagueId,
      name: 'Test League',
      adminId: '123e4567-e89b-12d3-a456-426614174001',
      scoringType: ScoringType.STANDARD,
      isPublic: true,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('should delete a league when it exists and has no tournaments', async () => {
    // Act
    const result = await deleteLeagueUseCase.execute(validLeagueId);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(true);
    expect(leagueRepository.leagues.length).toBe(0);
  });

  it('should fail if the league does not exist', async () => {
    // Act
    const result = await deleteLeagueUseCase.execute('non-existent-id');

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('La liga no existe');
    expect(leagueRepository.leagues.length).toBe(1);
  });

  it('should fail if the league has tournaments', async () => {
    // Arrange
    tournamentRepository.tournaments.push({
      id: 'tournament-1',
      leagueId: validLeagueId,
      name: 'Test Tournament',
    } as Tournament);

    // Act
    const result = await deleteLeagueUseCase.execute(validLeagueId);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('No se puede eliminar la liga porque tiene torneos asociados');
    expect(leagueRepository.leagues.length).toBe(1);
  });
}); 