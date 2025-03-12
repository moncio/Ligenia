import { GetLeagueByIdUseCase } from '../../../../../src/core/use-cases/league/get-league-by-id.use-case';
import { ILeagueRepository } from '../../../../../src/core/domain/interfaces/league-repository.interface';
import { League } from '../../../../../src/core/domain/entities/league.entity';
import { ScoringType } from '@prisma/client';

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

describe('GetLeagueByIdUseCase', () => {
  let leagueRepository: MockLeagueRepository;
  let getLeagueByIdUseCase: GetLeagueByIdUseCase;
  const validLeagueId = 'league-1';

  beforeEach(() => {
    leagueRepository = new MockLeagueRepository();
    getLeagueByIdUseCase = new GetLeagueByIdUseCase(leagueRepository);

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

  it('should return a league when a valid ID is provided', async () => {
    // Act
    const result = await getLeagueByIdUseCase.execute(validLeagueId);

    // Assert
    expect(result.isSuccess).toBe(true);
    const league = result.getValue();
    expect(league.id).toBe(validLeagueId);
    expect(league.name).toBe('Test League');
  });

  it('should fail when an invalid ID is provided', async () => {
    // Act
    const result = await getLeagueByIdUseCase.execute('non-existent-id');

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('La liga no existe');
  });
}); 