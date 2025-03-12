import { GetTeamByIdUseCase } from '../../../../../src/core/use-cases/team/get-team-by-id.use-case';
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

  async delete(): Promise<boolean> {
    return true;
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

  // Añadimos el método que faltaba
  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Team>> {
    return this.findPaginated(options);
  }
}

describe('GetTeamByIdUseCase', () => {
  let useCase: GetTeamByIdUseCase;
  let teamRepository: MockTeamRepository;

  beforeEach(() => {
    teamRepository = new MockTeamRepository();
    useCase = new GetTeamByIdUseCase(teamRepository);

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

  it('should get a team by id successfully', async () => {
    const result = await useCase.execute('team-1');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().id).toBe('team-1');
    expect(result.getValue().name).toBe('Test Team');
  });

  it('should fail if team does not exist', async () => {
    const result = await useCase.execute('non-existent-team');

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Equipo no encontrado');
  });
}); 