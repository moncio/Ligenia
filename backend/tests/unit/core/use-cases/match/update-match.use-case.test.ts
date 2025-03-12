import { UpdateMatchUseCase } from '../../../../../src/core/use-cases/match/update-match.use-case';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { ITeamRepository } from '../../../../../src/core/domain/interfaces/team-repository.interface';
import { Match } from '../../../../../src/core/domain/entities/match.entity';
import { Team } from '../../../../../src/core/domain/entities/team.entity';
import { UpdateMatchDto } from '../../../../../src/core/domain/dtos/update-match.dto';
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
    
    const updatedTeam = { ...this.teams[index], ...data };
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
    return this.teams.some(team => team.name === name && team.tournamentId === tournamentId);
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Team>> {
    return {
      data: this.teams,
      pagination: {
        total: this.teams.length,
        page: 1,
        limit: 10,
        totalPages: 1,
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

describe('UpdateMatchUseCase', () => {
  let useCase: UpdateMatchUseCase;
  let matchRepository: MockMatchRepository;
  let teamRepository: MockTeamRepository;
  const scheduledDate = new Date();
  const newScheduledDate = new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000); // 1 día después

  beforeEach(() => {
    matchRepository = new MockMatchRepository();
    teamRepository = new MockTeamRepository();
    useCase = new UpdateMatchUseCase(matchRepository, teamRepository);

    // Add teams for testing
    teamRepository.teams.push(
      new Team({
        id: 'team-1',
        name: 'Team 1',
        tournamentId: 'tournament-1',
        players: ['player1', 'player2'],
      }),
      new Team({
        id: 'team-2',
        name: 'Team 2',
        tournamentId: 'tournament-1',
        players: ['player3', 'player4'],
      }),
      new Team({
        id: 'team-3',
        name: 'Team 3',
        tournamentId: 'tournament-2',
        players: ['player5', 'player6'],
      })
    );

    // Add a match for testing
    matchRepository.matches.push(
      new Match({
        id: 'match-1',
        tournamentId: 'tournament-1',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate,
        status: MatchStatus.SCHEDULED,
      })
    );
  });

  it('should update a match successfully', async () => {
    const updateMatchDto: UpdateMatchDto = {
      scheduledDate: newScheduledDate,
      status: MatchStatus.IN_PROGRESS,
      notes: 'Updated notes',
    };

    const result = await useCase.execute(['match-1', updateMatchDto]);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().scheduledDate).toEqual(newScheduledDate);
    expect(result.getValue().status).toBe(MatchStatus.IN_PROGRESS);
    expect(result.getValue().notes).toBe('Updated notes');
  });

  it('should fail if match does not exist', async () => {
    const updateMatchDto: UpdateMatchDto = {
      scheduledDate: newScheduledDate,
    };

    const result = await useCase.execute(['non-existent-match', updateMatchDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El partido no existe');
  });

  it('should fail if team1 does not exist', async () => {
    const updateMatchDto: UpdateMatchDto = {
      team1Id: 'non-existent-team',
    };

    const result = await useCase.execute(['match-1', updateMatchDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 1 especificado no existe');
  });

  it('should fail if team2 does not exist', async () => {
    const updateMatchDto: UpdateMatchDto = {
      team2Id: 'non-existent-team',
    };

    const result = await useCase.execute(['match-1', updateMatchDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 2 especificado no existe');
  });

  it('should fail if team1 does not belong to the tournament', async () => {
    const updateMatchDto: UpdateMatchDto = {
      team1Id: 'team-3',
    };

    const result = await useCase.execute(['match-1', updateMatchDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 1 no pertenece al torneo del partido');
  });

  it('should fail if team2 does not belong to the tournament', async () => {
    const updateMatchDto: UpdateMatchDto = {
      team2Id: 'team-3',
    };

    const result = await useCase.execute(['match-1', updateMatchDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 2 no pertenece al torneo del partido');
  });

  it('should fail if teams are the same', async () => {
    const updateMatchDto: UpdateMatchDto = {
      team1Id: 'team-2',
    };

    const result = await useCase.execute(['match-1', updateMatchDto]);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Los equipos no pueden ser iguales');
  });

  it('should update only the provided fields', async () => {
    const updateMatchDto: UpdateMatchDto = {
      notes: 'Updated notes only',
    };

    const result = await useCase.execute(['match-1', updateMatchDto]);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().scheduledDate).toEqual(scheduledDate); // Unchanged
    expect(result.getValue().status).toBe(MatchStatus.SCHEDULED); // Unchanged
    expect(result.getValue().notes).toBe('Updated notes only'); // Changed
  });
}); 