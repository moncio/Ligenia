import { DeleteMatchUseCase } from '../../../../../src/core/use-cases/match/delete-match.use-case';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { Match } from '../../../../../src/core/domain/entities/match.entity';
import { MatchStatus } from '@prisma/client';
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

describe('DeleteMatchUseCase', () => {
  let useCase: DeleteMatchUseCase;
  let matchRepository: MockMatchRepository;

  beforeEach(() => {
    matchRepository = new MockMatchRepository();
    useCase = new DeleteMatchUseCase(matchRepository);

    // Add matches for testing
    matchRepository.matches.push(
      new Match({
        id: 'match-1',
        tournamentId: 'tournament-1',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      }),
      new Match({
        id: 'match-2',
        tournamentId: 'tournament-1',
        team1Id: 'team-3',
        team2Id: 'team-4',
        scheduledDate: new Date(),
        status: MatchStatus.COMPLETED,
      })
    );
  });

  it('should delete a match successfully', async () => {
    const initialCount = matchRepository.matches.length;
    const result = await useCase.execute('match-1');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(true);
    expect(matchRepository.matches.length).toBe(initialCount - 1);
    expect(matchRepository.matches.find(match => match.id === 'match-1')).toBeUndefined();
  });

  it('should fail if match does not exist', async () => {
    const initialCount = matchRepository.matches.length;
    const result = await useCase.execute('non-existent-match');

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El partido no existe');
    expect(matchRepository.matches.length).toBe(initialCount);
  });

  it('should return false if deletion fails', async () => {
    // Mock the delete method to return false
    jest.spyOn(matchRepository, 'delete').mockImplementationOnce(async () => false);

    const initialCount = matchRepository.matches.length;
    const result = await useCase.execute('match-1');

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('No se pudo eliminar el partido');
    expect(matchRepository.matches.length).toBe(initialCount);
  });
}); 