import { GetAllMatchesUseCase } from '../../../../../src/core/use-cases/match/get-all-matches.use-case';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { Match } from '../../../../../src/core/domain/entities/match.entity';
import { MatchStatus } from '@prisma/client';
import { PaginationOptions, PaginatedResult } from '../../../../../src/core/domain/interfaces/repository.interface';
import { Result } from '../../../../../src/core/domain/interfaces/use-case.interface';

// Mock del repositorio de partidos
class MockMatchRepository implements IMatchRepository {
  matches: Match[] = [];

  async findById(id: string): Promise<Match | null> {
    return this.matches.find(match => match.id === id) || null;
  }

  async findAll(): Promise<Match[]> {
    return this.matches;
  }

  async create(data: Match): Promise<Match> {
    this.matches.push(data);
    return data;
  }

  async update(id: string, data: Partial<Match>): Promise<Match | null> {
    const index = this.matches.findIndex(match => match.id === id);
    if (index === -1) return null;
    
    const updatedMatch = { ...this.matches[index], ...data };
    this.matches[index] = updatedMatch as Match;
    return updatedMatch as Match;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.matches.length;
    this.matches = this.matches.filter(match => match.id !== id);
    return initialLength > this.matches.length;
  }

  async findByTournament(tournamentId: string): Promise<Match[]> {
    return this.matches.filter(match => match.tournamentId === tournamentId);
  }

  async findByTeam(teamId: string): Promise<Match[]> {
    return this.matches.filter(match => match.team1Id === teamId || match.team2Id === teamId);
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Match>> {
    const { page = 1, limit = 10 } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = this.matches.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        total: this.matches.length,
        page,
        limit,
        totalPages: Math.ceil(this.matches.length / limit),
      },
    };
  }

  async count(): Promise<number> {
    return this.matches.length;
  }

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Match>> {
    return this.findPaginated(options);
  }
}

describe('GetAllMatchesUseCase', () => {
  let useCase: GetAllMatchesUseCase;
  let matchRepository: MockMatchRepository;

  beforeEach(() => {
    matchRepository = new MockMatchRepository();
    useCase = new GetAllMatchesUseCase(matchRepository);

    // Add matches for testing
    for (let i = 1; i <= 15; i++) {
      matchRepository.matches.push(
        new Match({
          id: `match-${i}`,
          tournamentId: 'tournament-1',
          team1Id: 'team-1',
          team2Id: 'team-2',
          scheduledDate: new Date(),
          status: MatchStatus.SCHEDULED,
        })
      );
    }
  });

  it('should get all matches with default pagination', async () => {
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

  it('should get matches with custom pagination', async () => {
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