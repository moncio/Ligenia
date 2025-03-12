import { DeleteTeamUseCase } from '../../../../../src/core/use-cases/team/delete-team.use-case';
import { ITeamRepository } from '../../../../../src/core/domain/interfaces/team-repository.interface';
import { Team } from '../../../../../src/core/domain/entities/team.entity';
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

  async create(): Promise<Team> {
    return {} as Team;
  }

  async update(): Promise<Team | null> {
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.teams.length;
    this.teams = this.teams.filter(team => team.id !== id);
    return initialLength > this.teams.length;
  }

  async findByTournament(): Promise<Team[]> {
    return [];
  }

  async existsByNameInTournament(): Promise<boolean> {
    return false;
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

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Team>> {
    return this.findPaginated(options);
  }
}

describe('DeleteTeamUseCase', () => {
  let useCase: DeleteTeamUseCase;
  let teamRepository: MockTeamRepository;

  beforeEach(() => {
    teamRepository = new MockTeamRepository();
    useCase = new DeleteTeamUseCase(teamRepository);

    // Add a team for testing
    teamRepository.teams.push(
      new Team({
        id: 'team-1',
        name: 'Test Team',
        tournamentId: 'tournament-1',
        players: ['player1', 'player2'],
      })
    );
  });

  it('should delete a team successfully', async () => {
    const result = await useCase.execute('team-1');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(true);
    expect(teamRepository.teams.length).toBe(0);
  });

  it('should fail if team does not exist', async () => {
    const result = await useCase.execute('non-existent-team');

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo no existe');
    expect(teamRepository.teams.length).toBe(1);
  });

  it('should fail if delete operation fails', async () => {
    // Mock the delete method to return false
    teamRepository.delete = jest.fn().mockResolvedValue(false);

    const result = await useCase.execute('team-1');

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('No se pudo eliminar el equipo');
  });
}); 