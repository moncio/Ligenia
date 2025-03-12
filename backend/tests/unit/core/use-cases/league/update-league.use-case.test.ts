import { UpdateLeagueUseCase } from '../../../../../src/core/use-cases/league/update-league.use-case';
import { ILeagueRepository } from '../../../../../src/core/domain/interfaces/league-repository.interface';
import { League } from '../../../../../src/core/domain/entities/league.entity';
import { ScoringType } from '@prisma/client';
import { UpdateLeagueDto } from '../../../../../src/core/domain/dtos/update-league.dto';

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
    
    const updatedLeague = { ...this.leagues[index], ...data, updatedAt: new Date() };
    this.leagues[index] = updatedLeague as League;
    return updatedLeague as League;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.leagues.length;
    this.leagues = this.leagues.filter(league => league.id !== id);
    return initialLength > this.leagues.length;
  }

  async findByName(name: string): Promise<League[]> {
    return this.leagues.filter(league => 
      league.name.toLowerCase() === name.toLowerCase()
    );
  }

  async findByAdmin(): Promise<League[]> {
    return [];
  }

  async existsByName(name: string): Promise<boolean> {
    return this.leagues.some(
      league => league.name.toLowerCase() === name.toLowerCase()
    );
  }
}

describe('UpdateLeagueUseCase', () => {
  let leagueRepository: MockLeagueRepository;
  let updateLeagueUseCase: UpdateLeagueUseCase;
  const validLeagueId = 'league-1';
  let originalLeague: League;

  beforeEach(() => {
    leagueRepository = new MockLeagueRepository();
    updateLeagueUseCase = new UpdateLeagueUseCase(leagueRepository);

    // Crear una liga válida para las pruebas
    originalLeague = new League({
      id: validLeagueId,
      name: 'Test League',
      adminId: '123e4567-e89b-12d3-a456-426614174001',
      scoringType: ScoringType.STANDARD,
      isPublic: true,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    leagueRepository.leagues.push(originalLeague);
    
    // Crear otra liga para probar la validación de nombre único
    leagueRepository.leagues.push(new League({
      id: 'league-2',
      name: 'Another League',
      adminId: '123e4567-e89b-12d3-a456-426614174002',
      scoringType: ScoringType.STANDARD,
      isPublic: true,
      creationDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('should update a league with valid data', async () => {
    // Arrange
    const updateData: UpdateLeagueDto = {
      name: 'Updated League Name',
      description: 'Updated description',
      scoringType: ScoringType.ADVANCED,
      isPublic: false,
    };

    // Act
    const result = await updateLeagueUseCase.execute([validLeagueId, updateData]);

    // Assert
    expect(result.isSuccess).toBe(true);
    const updatedLeague = result.getValue();
    expect(updatedLeague.name).toBe(updateData.name);
    expect(updatedLeague.description).toBe(updateData.description);
    expect(updatedLeague.scoringType).toBe(updateData.scoringType);
    expect(updatedLeague.isPublic).toBe(updateData.isPublic);
    expect(updatedLeague.adminId).toBe(originalLeague.adminId); // No debería cambiar
  });

  it('should fail if the league does not exist', async () => {
    // Arrange
    const updateData: UpdateLeagueDto = {
      name: 'Updated League Name',
    };

    // Act
    const result = await updateLeagueUseCase.execute(['non-existent-id', updateData]);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('La liga no existe');
  });

  it('should fail if trying to update to a name that already exists', async () => {
    // Arrange
    const updateData: UpdateLeagueDto = {
      name: 'Another League', // Este nombre ya existe en otra liga
    };

    // Act
    const result = await updateLeagueUseCase.execute([validLeagueId, updateData]);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Ya existe una liga con el nombre');
  });

  it('should not fail if updating with the same name', async () => {
    // Arrange
    const updateData: UpdateLeagueDto = {
      name: 'Test League', // El mismo nombre que ya tiene
      description: 'Updated description',
    };

    // Act
    const result = await updateLeagueUseCase.execute([validLeagueId, updateData]);

    // Assert
    expect(result.isSuccess).toBe(true);
    const updatedLeague = result.getValue();
    expect(updatedLeague.name).toBe(updateData.name);
    expect(updatedLeague.description).toBe(updateData.description);
  });

  it('should update only the provided fields', async () => {
    // Arrange
    const updateData: UpdateLeagueDto = {
      description: 'Only update description',
    };

    // Act
    const result = await updateLeagueUseCase.execute([validLeagueId, updateData]);

    // Assert
    expect(result.isSuccess).toBe(true);
    const updatedLeague = result.getValue();
    expect(updatedLeague.name).toBe(originalLeague.name); // No debería cambiar
    expect(updatedLeague.description).toBe(updateData.description);
    expect(updatedLeague.scoringType).toBe(originalLeague.scoringType); // No debería cambiar
    expect(updatedLeague.isPublic).toBe(originalLeague.isPublic); // No debería cambiar
  });
}); 