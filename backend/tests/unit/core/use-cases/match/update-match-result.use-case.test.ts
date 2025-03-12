import { UpdateMatchResultUseCase } from '../../../../../src/core/use-cases/match/update-match-result.use-case';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { Match, MatchScore } from '../../../../../src/core/domain/entities/match.entity';
import { MatchStatus } from '@prisma/client';
import { UpdateMatchResultDto } from '../../../../../src/core/domain/dtos/update-match-result.dto';
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
    
    const updatedMatch = { ...this.matches[index], ...data, updatedAt: new Date() };
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

describe('UpdateMatchResultUseCase', () => {
  let useCase: UpdateMatchResultUseCase;
  let matchRepository: MockMatchRepository;

  beforeEach(() => {
    matchRepository = new MockMatchRepository();
    useCase = new UpdateMatchResultUseCase(matchRepository);

    // Añadir partidos para las pruebas
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
        score: {
          sets: [
            { team1: 6, team2: 4 },
            { team1: 6, team2: 3 }
          ]
        }
      })
    );
  });

  it('should update a match result successfully', async () => {
    const updateResultDto: UpdateMatchResultDto = {
      score: {
        sets: [
          { team1: 7, team2: 5 },
          { team1: 6, team2: 4 }
        ]
      }
    };

    const result = await useCase.execute(['match-2', updateResultDto]);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().score).toEqual(updateResultDto.score);
    expect(result.getValue().status).toBe(MatchStatus.COMPLETED);
  });

  it('should fail if match does not exist', async () => {
    const updateResultDto: UpdateMatchResultDto = {
      score: {
        sets: [
          { team1: 6, team2: 4 },
          { team1: 7, team2: 6 }
        ]
      }
    };

    const result = await useCase.execute(['non-existent-match', updateResultDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El partido no existe');
  });

  it('should fail if match does not have a result yet', async () => {
    const updateResultDto: UpdateMatchResultDto = {
      score: {
        sets: [
          { team1: 6, team2: 4 },
          { team1: 7, team2: 6 }
        ]
      }
    };

    const result = await useCase.execute(['match-1', updateResultDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El partido no tiene un resultado para actualizar');
  });

  it('should fail if score is invalid (empty sets)', async () => {
    const updateResultDto: UpdateMatchResultDto = {
      score: {
        sets: []
      }
    };

    const result = await useCase.execute(['match-2', updateResultDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El resultado debe tener al menos un set');
  });

  it('should fail if score is invalid (negative points)', async () => {
    const updateResultDto: UpdateMatchResultDto = {
      score: {
        sets: [
          { team1: -1, team2: 4 },
          { team1: 6, team2: 3 }
        ]
      }
    };

    const result = await useCase.execute(['match-2', updateResultDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Los puntos no pueden ser negativos');
  });
}); 