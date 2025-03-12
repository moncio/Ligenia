import { GetAllLeaguesUseCase } from '../../../../../src/core/use-cases/league/get-all-leagues.use-case';
import { ILeagueRepository } from '../../../../../src/core/domain/interfaces/league-repository.interface';
import { League } from '../../../../../src/core/domain/entities/league.entity';
import { ScoringType } from '@prisma/client';
import { PaginationOptions } from '../../../../../src/core/domain/interfaces/repository.interface';

// Mock del repositorio de ligas
class MockLeagueRepository implements ILeagueRepository {
  leagues: League[] = [];

  async findById(id: string): Promise<League | null> {
    return this.leagues.find(league => league.id === id) || null;
  }

  async findAll(): Promise<League[]> {
    return this.leagues;
  }

  async findAllPaginated(options: PaginationOptions): Promise<any> {
    const { page = 1, limit = 10 } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = this.leagues.slice(startIndex, endIndex);
    
    return {
      data,
      pagination: {
        total: this.leagues.length,
        page,
        limit,
        totalPages: Math.ceil(this.leagues.length / limit),
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

describe('GetAllLeaguesUseCase', () => {
  let leagueRepository: MockLeagueRepository;
  let getAllLeaguesUseCase: GetAllLeaguesUseCase;

  beforeEach(() => {
    leagueRepository = new MockLeagueRepository();
    getAllLeaguesUseCase = new GetAllLeaguesUseCase(leagueRepository);

    // Crear algunas ligas para las pruebas
    for (let i = 1; i <= 15; i++) {
      leagueRepository.leagues.push(new League({
        id: `league-${i}`,
        name: `Test League ${i}`,
        adminId: '123e4567-e89b-12d3-a456-426614174001',
        scoringType: ScoringType.STANDARD,
        isPublic: true,
        creationDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }
  });

  it('should return all leagues with default pagination', async () => {
    // Act
    const result = await getAllLeaguesUseCase.execute({});

    // Assert
    expect(result.isSuccess).toBe(true);
    const { data, pagination } = result.getValue();
    expect(data.length).toBe(10); // Default limit is 10
    expect(pagination.page).toBe(1);
    expect(pagination.limit).toBe(10);
    expect(pagination.total).toBe(15);
    expect(pagination.totalPages).toBe(2);
  });

  it('should return leagues with custom pagination', async () => {
    // Act
    const result = await getAllLeaguesUseCase.execute({ page: 2, limit: 5 });

    // Assert
    expect(result.isSuccess).toBe(true);
    const { data, pagination } = result.getValue();
    expect(data.length).toBe(5);
    expect(pagination.page).toBe(2);
    expect(pagination.limit).toBe(5);
    expect(pagination.total).toBe(15);
    expect(pagination.totalPages).toBe(3);
  });

  it('should return empty array when no leagues exist', async () => {
    // Arrange
    leagueRepository.leagues = [];

    // Act
    const result = await getAllLeaguesUseCase.execute({});

    // Assert
    expect(result.isSuccess).toBe(true);
    const { data, pagination } = result.getValue();
    expect(data.length).toBe(0);
    expect(pagination.total).toBe(0);
    expect(pagination.totalPages).toBe(0);
  });
}); 