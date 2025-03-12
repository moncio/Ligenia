import { GetMatchByIdUseCase } from '../../../../../src/core/use-cases/match/get-match-by-id.use-case';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { Match } from '../../../../../src/core/domain/entities/match.entity';
import { MatchStatus } from '@prisma/client';
import { Result } from '../../../../../src/core/domain/interfaces/use-case.interface';
import { PaginationOptions, PaginatedResult } from '../../../../../src/core/domain/interfaces/repository.interface';

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

describe('GetMatchByIdUseCase', () => {
  let useCase: GetMatchByIdUseCase;
  let matchRepository: MockMatchRepository;

  beforeEach(() => {
    matchRepository = new MockMatchRepository();
    useCase = new GetMatchByIdUseCase(matchRepository);

    // Add a match for testing
    matchRepository.matches.push(
      new Match({
        id: 'match-1',
        tournamentId: 'tournament-1',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      })
    );
  });

  it('should get a match by id successfully', async () => {
    const result = await useCase.execute('match-1');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().id).toBe('match-1');
    expect(result.getValue().tournamentId).toBe('tournament-1');
    expect(result.getValue().team1Id).toBe('team-1');
    expect(result.getValue().team2Id).toBe('team-2');
  });

  it('should fail if match does not exist', async () => {
    const result = await useCase.execute('non-existent-match');

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Partido no encontrado');
  });
}); 