import { ScoringType } from '@prisma/client';
import { CreateLeagueUseCase } from '../../../../../src/core/use-cases/league/create-league.use-case';
import { ILeagueRepository } from '../../../../../src/core/domain/interfaces/league-repository.interface';
import { League } from '../../../../../src/core/domain/entities/league.entity';
import { CreateLeagueDto } from '../../../../../src/core/domain/dtos/create-league.dto';

// Mock del repositorio de ligas
class MockLeagueRepository implements ILeagueRepository {
  leagues: League[] = [];

  async findById(id: string): Promise<League | null> {
    return this.leagues.find(league => league.id === id) || null;
  }

  async findAll(): Promise<League[]> {
    return this.leagues;
  }

  async findAllPaginated(options: any): Promise<any> {
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

  async findByName(name: string): Promise<League[]> {
    return this.leagues.filter(league => league.name.toLowerCase().includes(name.toLowerCase()));
  }

  async findByAdmin(adminId: string): Promise<League[]> {
    return this.leagues.filter(league => league.adminId === adminId);
  }

  async existsByName(name: string): Promise<boolean> {
    return this.leagues.some(league => league.name.toLowerCase() === name.toLowerCase());
  }
}

describe('CreateLeagueUseCase', () => {
  let leagueRepository: MockLeagueRepository;
  let createLeagueUseCase: CreateLeagueUseCase;

  beforeEach(() => {
    leagueRepository = new MockLeagueRepository();
    createLeagueUseCase = new CreateLeagueUseCase(leagueRepository);
  });

  it('should create a new league with valid data', async () => {
    // Arrange
    const leagueData: CreateLeagueDto = {
      name: 'Liga de Padel 2024',
      adminId: '123e4567-e89b-12d3-a456-426614174000',
      scoringType: ScoringType.STANDARD,
      isPublic: true,
    };

    // Act
    const result = await createLeagueUseCase.execute(leagueData);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().name).toBe(leagueData.name);
    expect(result.getValue().adminId).toBe(leagueData.adminId);
    expect(result.getValue().scoringType).toBe(leagueData.scoringType);
    expect(leagueRepository.leagues.length).toBe(1);
  });

  it('should fail if a league with the same name already exists', async () => {
    // Arrange
    const leagueData: CreateLeagueDto = {
      name: 'Liga de Padel 2024',
      adminId: '123e4567-e89b-12d3-a456-426614174000',
      scoringType: ScoringType.STANDARD,
      isPublic: true,
    };

    // Create a league first
    await createLeagueUseCase.execute(leagueData);

    // Try to create another league with the same name
    const result = await createLeagueUseCase.execute(leagueData);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Ya existe una liga con el nombre');
    expect(leagueRepository.leagues.length).toBe(1);
  });

  it('should create a league with optional fields', async () => {
    // Arrange
    const leagueData: CreateLeagueDto = {
      name: 'Liga de Padel 2024',
      adminId: '123e4567-e89b-12d3-a456-426614174000',
      scoringType: ScoringType.ADVANCED,
      description: 'Liga oficial de padel para la temporada 2024',
      logoUrl: 'https://example.com/logo.png',
      isPublic: false,
    };

    // Act
    const result = await createLeagueUseCase.execute(leagueData);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().name).toBe(leagueData.name);
    expect(result.getValue().description).toBe(leagueData.description);
    expect(result.getValue().logoUrl).toBe(leagueData.logoUrl);
    expect(result.getValue().isPublic).toBe(false);
  });
}); 