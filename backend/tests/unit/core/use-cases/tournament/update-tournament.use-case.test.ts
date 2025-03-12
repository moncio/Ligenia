import { TournamentFormat, TournamentStatus } from '@prisma/client';
import { UpdateTournamentUseCase } from '../../../../../src/core/use-cases/tournament/update-tournament.use-case';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { UpdateTournamentDto } from '../../../../../src/core/domain/dtos/update-tournament.dto';
import { ILeagueRepository } from '../../../../../src/core/domain/interfaces/league-repository.interface';
import { League } from '../../../../../src/core/domain/entities/league.entity';

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
        tournament.leagueId === leagueId && 
        tournament.id !== 'tournament-1' // Excluir el torneo que estamos actualizando
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

  async create(): Promise<League> {
    return {} as League;
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

describe('UpdateTournamentUseCase', () => {
  let tournamentRepository: MockTournamentRepository;
  let leagueRepository: MockLeagueRepository;
  let updateTournamentUseCase: UpdateTournamentUseCase;
  const validTournamentId = 'tournament-1';
  const validLeagueId = '123e4567-e89b-12d3-a456-426614174000';
  const anotherValidLeagueId = '123e4567-e89b-12d3-a456-426614174001';
  let originalTournament: Tournament;

  beforeEach(() => {
    tournamentRepository = new MockTournamentRepository();
    leagueRepository = new MockLeagueRepository();
    updateTournamentUseCase = new UpdateTournamentUseCase(tournamentRepository, leagueRepository);

    // Crear ligas válidas para las pruebas
    leagueRepository.leagues.push({
      id: validLeagueId,
      name: 'Test League',
    } as League);

    leagueRepository.leagues.push({
      id: anotherValidLeagueId,
      name: 'Another League',
    } as League);

    // Crear un torneo válido para las pruebas
    originalTournament = new Tournament({
      id: validTournamentId,
      name: 'Test Tournament',
      leagueId: validLeagueId,
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
    });
    
    tournamentRepository.tournaments.push(originalTournament);
    
    // Crear otro torneo para probar la validación de nombre único
    tournamentRepository.tournaments.push(new Tournament({
      id: 'tournament-2',
      name: 'Another Tournament',
      leagueId: validLeagueId,
      format: LocalTournamentFormat.SINGLE_ELIMINATION as TournamentFormat,
      status: LocalTournamentStatus.DRAFT as TournamentStatus,
      startDate: new Date('2024-12-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  it('should update a tournament with valid data', async () => {
    // Arrange
    const updateData: UpdateTournamentDto = {
      name: 'Updated Tournament Name',
      description: 'Updated description',
      format: LocalTournamentFormat.DOUBLE_ELIMINATION as TournamentFormat,
      status: LocalTournamentStatus.REGISTRATION as TournamentStatus,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-01-31'),
    };

    // Act
    const result = await updateTournamentUseCase.execute([validTournamentId, updateData]);

    // Assert
    expect(result.isSuccess).toBe(true);
    const updatedTournament = result.getValue();
    expect(updatedTournament.name).toBe(updateData.name);
    expect(updatedTournament.description).toBe(updateData.description);
    expect(updatedTournament.format).toBe(updateData.format);
    expect(updatedTournament.status).toBe(updateData.status);
    expect(updatedTournament.startDate).toEqual(updateData.startDate);
    expect(updatedTournament.endDate).toEqual(updateData.endDate);
    expect(updatedTournament.leagueId).toBe(originalTournament.leagueId); // No debería cambiar
  });

  it('should fail if the tournament does not exist', async () => {
    // Arrange
    const updateData: UpdateTournamentDto = {
      name: 'Updated Tournament Name',
    };

    // Act
    const result = await updateTournamentUseCase.execute(['non-existent-id', updateData]);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('El torneo no existe');
  });

  it('should fail if trying to update to a name that already exists in the same league', async () => {
    // Arrange
    const updateData: UpdateTournamentDto = {
      name: 'Another Tournament', // Este nombre ya existe en otro torneo de la misma liga
    };

    // Act
    const result = await updateTournamentUseCase.execute([validTournamentId, updateData]);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Ya existe un torneo con el nombre');
  });

  it('should not fail if updating with the same name', async () => {
    // Arrange
    const updateData: UpdateTournamentDto = {
      name: 'Test Tournament', // El mismo nombre que ya tiene
      description: 'Updated description',
    };

    // Act
    const result = await updateTournamentUseCase.execute([validTournamentId, updateData]);

    // Assert
    expect(result.isSuccess).toBe(true);
    const updatedTournament = result.getValue();
    expect(updatedTournament.name).toBe(updateData.name);
    expect(updatedTournament.description).toBe(updateData.description);
  });

  it('should update only the provided fields', async () => {
    // Arrange
    const updateData: UpdateTournamentDto = {
      description: 'Only update description',
    };

    // Act
    const result = await updateTournamentUseCase.execute([validTournamentId, updateData]);

    // Assert
    expect(result.isSuccess).toBe(true);
    const updatedTournament = result.getValue();
    expect(updatedTournament.name).toBe(originalTournament.name); // No debería cambiar
    expect(updatedTournament.description).toBe(updateData.description);
    expect(updatedTournament.format).toBe(originalTournament.format); // No debería cambiar
    expect(updatedTournament.status).toBe(originalTournament.status); // No debería cambiar
  });

  it('should fail if trying to update to a non-existent league', async () => {
    // Arrange
    const updateData: UpdateTournamentDto = {
      leagueId: 'non-existent-league-id',
    };

    // Act
    const result = await updateTournamentUseCase.execute([validTournamentId, updateData]);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('La liga especificada no existe');
  });

  it('should update the league if a valid leagueId is provided', async () => {
    // Arrange
    const updateData: UpdateTournamentDto = {
      leagueId: anotherValidLeagueId,
    };

    // Act
    const result = await updateTournamentUseCase.execute([validTournamentId, updateData]);

    // Assert
    expect(result.isSuccess).toBe(true);
    const updatedTournament = result.getValue();
    expect(updatedTournament.leagueId).toBe(anotherValidLeagueId);
  });
}); 