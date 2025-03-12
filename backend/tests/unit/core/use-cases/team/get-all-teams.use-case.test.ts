import { GetAllTeamsUseCase } from '../../../../../src/core/use-cases/team/get-all-teams.use-case';
import { ITeamRepository } from '../../../../../src/core/domain/interfaces/team-repository.interface';
import { Team } from '../../../../../src/core/domain/entities/team.entity';
import { PaginationOptions, PaginatedResult } from '../../../../../src/core/domain/interfaces/repository.interface';
import { Result } from '../../../../../src/core/domain/interfaces/use-case.interface';

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

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Team>> {
    return this.findPaginated(options);
  }
}

describe('GetAllTeamsUseCase', () => {
  let useCase: GetAllTeamsUseCase;
  let teamRepository: MockTeamRepository;

  beforeEach(() => {
    teamRepository = new MockTeamRepository();
    useCase = new GetAllTeamsUseCase(teamRepository);

    // Add teams for testing
    for (let i = 1; i <= 15; i++) {
      teamRepository.teams.push(
        new Team({
          id: `team-${i}`,
          name: `Test Team ${i}`,
          tournamentId: 'tournament-1',
          players: ['player1', 'player2'],
        })
      );
    }
  });

  it('should get all teams with default pagination', async () => {
    const options: PaginationOptions = {
      page: 1,
      limit: 10,
    };

    const result = await useCase.execute(options);

    expect(result.isSuccess).toBe(true);
    const paginatedResult = result.getValue();
    expect(paginatedResult).toBeDefined();
    expect(paginatedResult.data.length).toBe(10);
    expect(paginatedResult.pagination.total).toBe(15);
    expect(paginatedResult.pagination.page).toBe(1);
    expect(paginatedResult.pagination.limit).toBe(10);
    expect(paginatedResult.pagination.totalPages).toBe(2);
  });

  it('should get teams with custom pagination', async () => {
    const options: PaginationOptions = {
      page: 2,
      limit: 5,
    };

    const result = await useCase.execute(options);

    expect(result.isSuccess).toBe(true);
    const paginatedResult = result.getValue();
    expect(paginatedResult).toBeDefined();
    expect(paginatedResult.data.length).toBe(5);
    expect(paginatedResult.pagination.total).toBe(15);
    expect(paginatedResult.pagination.page).toBe(2);
    expect(paginatedResult.pagination.limit).toBe(5);
    expect(paginatedResult.pagination.totalPages).toBe(3);
  });

  it('should return empty array if page is out of range', async () => {
    const options: PaginationOptions = {
      page: 4,
      limit: 5,
    };

    const result = await useCase.execute(options);

    expect(result.isSuccess).toBe(true);
    const paginatedResult = result.getValue();
    expect(paginatedResult).toBeDefined();
    expect(paginatedResult.data.length).toBe(0);
    expect(paginatedResult.pagination.total).toBe(15);
    expect(paginatedResult.pagination.page).toBe(4);
    expect(paginatedResult.pagination.limit).toBe(5);
    expect(paginatedResult.pagination.totalPages).toBe(3);
  });
}); 