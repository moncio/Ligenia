import { UpdateTeamUseCase } from '../../../../../src/core/use-cases/team/update-team.use-case';
import { ITeamRepository } from '../../../../../src/core/domain/interfaces/team-repository.interface';
import { Team } from '../../../../../src/core/domain/entities/team.entity';
import { UpdateTeamDto } from '../../../../../src/core/domain/dtos/update-team.dto';
import { Result } from '../../../../../src/core/domain/interfaces/use-case.interface';
import { PaginationOptions, PaginatedResult } from '../../../../../src/core/domain/interfaces/repository.interface';

// Mock del repositorio de equipos
class MockTeamRepository implements ITeamRepository {
  teams: Team[] = [];

  async findById(id: string): Promise<Team | null> {
    return this.teams.find(team => team.id === id) || null;
  }

  async findAll(): Promise<Team[]> {
    return this.teams;
  }

  async create(data: Team): Promise<Team> {
    this.teams.push(data);
    return data;
  }

  async update(id: string, data: Partial<Team>): Promise<Team | null> {
    const index = this.teams.findIndex(team => team.id === id);
    if (index === -1) return null;
    
    const updatedTeam = { ...this.teams[index], ...data, updatedAt: new Date() };
    this.teams[index] = updatedTeam as Team;
    return updatedTeam as Team;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.teams.length;
    this.teams = this.teams.filter(team => team.id !== id);
    return initialLength > this.teams.length;
  }

  async findByTournament(tournamentId: string): Promise<Team[]> {
    return this.teams.filter(team => team.tournamentId === tournamentId);
  }

  async existsByNameInTournament(name: string, tournamentId: string): Promise<boolean> {
    return this.teams.some(team => team.name === name && team.tournamentId === tournamentId && team.name !== name);
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Team>> {
    const { page = 1, limit = 10 } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = this.teams.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        total: this.teams.length,
        page,
        limit,
        totalPages: Math.ceil(this.teams.length / limit),
      },
    };
  }

  async count(): Promise<number> {
    return this.teams.length;
  }

  // Añadimos el método que faltaba
  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Team>> {
    return this.findPaginated(options);
  }
}

describe('UpdateTeamUseCase', () => {
  let useCase: UpdateTeamUseCase;
  let teamRepository: MockTeamRepository;

  beforeEach(() => {
    teamRepository = new MockTeamRepository();
    useCase = new UpdateTeamUseCase(teamRepository);

    // Add a team for testing
    teamRepository.teams.push(
      new Team({
        id: 'team-1',
        name: 'Test Team',
        tournamentId: 'tournament-1',
        players: ['player1', 'player2'],
        ranking: 100,
        logoUrl: 'https://example.com/logo.png',
      })
    );
  });

  it('should update a team successfully', async () => {
    const updateTeamDto: UpdateTeamDto = {
      name: 'Updated Team',
      ranking: 200,
    };

    const result = await useCase.execute(['team-1', updateTeamDto]);

    expect(result.isSuccess).toBe(true);
    const updatedTeam = result.getValue();
    expect(updatedTeam).toBeDefined();
    expect(updatedTeam.name).toBe('Updated Team');
    expect(updatedTeam.ranking).toBe(200);
    expect(updatedTeam.players).toEqual(['player1', 'player2']);
  });

  it('should fail if team does not exist', async () => {
    const updateTeamDto: UpdateTeamDto = {
      name: 'Updated Team',
    };

    const result = await useCase.execute(['non-existent-team', updateTeamDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo no existe');
  });

  it('should fail if team name already exists in tournament', async () => {
    // Add another team in the same tournament
    teamRepository.teams.push(
      new Team({
        id: 'team-2',
        name: 'Another Team',
        tournamentId: 'tournament-1',
        players: ['player3', 'player4'],
      })
    );

    // Mock the existsByNameInTournament method to return true
    teamRepository.existsByNameInTournament = jest.fn().mockResolvedValue(true);

    const updateTeamDto: UpdateTeamDto = {
      name: 'Another Team',
    };

    const result = await useCase.execute(['team-1', updateTeamDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Ya existe un equipo con el nombre "Another Team" en el torneo');
  });
}); 