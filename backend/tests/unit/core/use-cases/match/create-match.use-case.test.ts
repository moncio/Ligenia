import { CreateMatchUseCase } from '../../../../../src/core/use-cases/match/create-match.use-case';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { ITeamRepository } from '../../../../../src/core/domain/interfaces/team-repository.interface';
import { Match } from '../../../../../src/core/domain/entities/match.entity';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { Team } from '../../../../../src/core/domain/entities/team.entity';
import { CreateMatchDto } from '../../../../../src/core/domain/dtos/create-match.dto';
import { TournamentFormat, TournamentStatus, MatchStatus } from '@prisma/client';
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

// Mock del repositorio de torneos
class MockTournamentRepository implements ITournamentRepository {
  tournaments: Tournament[] = [];

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(tournament => tournament.id === id) || null;
  }

  async findAll(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async create(data: Tournament): Promise<Tournament> {
    this.tournaments.push(data);
    return data;
  }

  async update(id: string, data: Partial<Tournament>): Promise<Tournament | null> {
    const index = this.tournaments.findIndex(tournament => tournament.id === id);
    if (index === -1) return null;
    
    const updatedTournament = { ...this.tournaments[index], ...data };
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
    return this.tournaments.some(tournament => tournament.name === name && tournament.leagueId === leagueId);
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Tournament>> {
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

  async count(): Promise<number> {
    return this.tournaments.length;
  }

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Tournament>> {
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

describe('CreateMatchUseCase', () => {
  let useCase: CreateMatchUseCase;
  let matchRepository: MockMatchRepository;
  let tournamentRepository: MockTournamentRepository;
  let teamRepository: MockTeamRepository;
  const scheduledDate = new Date();

  beforeEach(() => {
    matchRepository = new MockMatchRepository();
    tournamentRepository = new MockTournamentRepository();
    teamRepository = new MockTeamRepository();
    useCase = new CreateMatchUseCase(matchRepository, tournamentRepository, teamRepository);

    // Add a tournament for testing
    tournamentRepository.tournaments.push(
      new Tournament({
        id: 'tournament-1',
        name: 'Test Tournament',
        leagueId: 'league-1',
        format: TournamentFormat.SINGLE_ELIMINATION,
        status: TournamentStatus.ACTIVE,
        startDate: new Date(),
      })
    );

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
  });

  it('should create a match successfully', async () => {
    const createMatchDto: CreateMatchDto = {
      tournamentId: 'tournament-1',
      team1Id: 'team-1',
      team2Id: 'team-2',
      scheduledDate,
      courtId: 'court-1',
      status: MatchStatus.SCHEDULED,
      notes: 'Test match',
      round: 1,
      matchNumber: 1,
    };

    const result = await useCase.execute(createMatchDto);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().tournamentId).toBe(createMatchDto.tournamentId);
    expect(result.getValue().team1Id).toBe(createMatchDto.team1Id);
    expect(result.getValue().team2Id).toBe(createMatchDto.team2Id);
    expect(result.getValue().scheduledDate).toBe(createMatchDto.scheduledDate);
    expect(matchRepository.matches.length).toBe(1);
  });

  it('should fail if tournament does not exist', async () => {
    const createMatchDto: CreateMatchDto = {
      tournamentId: 'non-existent-tournament',
      team1Id: 'team-1',
      team2Id: 'team-2',
      scheduledDate,
    };

    const result = await useCase.execute(createMatchDto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El torneo especificado no existe');
    expect(matchRepository.matches.length).toBe(0);
  });

  it('should fail if team1 does not exist', async () => {
    const createMatchDto: CreateMatchDto = {
      tournamentId: 'tournament-1',
      team1Id: 'non-existent-team',
      team2Id: 'team-2',
      scheduledDate,
    };

    const result = await useCase.execute(createMatchDto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 1 especificado no existe');
    expect(matchRepository.matches.length).toBe(0);
  });

  it('should fail if team2 does not exist', async () => {
    const createMatchDto: CreateMatchDto = {
      tournamentId: 'tournament-1',
      team1Id: 'team-1',
      team2Id: 'non-existent-team',
      scheduledDate,
    };

    const result = await useCase.execute(createMatchDto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 2 especificado no existe');
    expect(matchRepository.matches.length).toBe(0);
  });

  it('should fail if team1 does not belong to the tournament', async () => {
    const createMatchDto: CreateMatchDto = {
      tournamentId: 'tournament-1',
      team1Id: 'team-3',
      team2Id: 'team-2',
      scheduledDate,
    };

    const result = await useCase.execute(createMatchDto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 1 no pertenece al torneo especificado');
    expect(matchRepository.matches.length).toBe(0);
  });

  it('should fail if team2 does not belong to the tournament', async () => {
    const createMatchDto: CreateMatchDto = {
      tournamentId: 'tournament-1',
      team1Id: 'team-1',
      team2Id: 'team-3',
      scheduledDate,
    };

    const result = await useCase.execute(createMatchDto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El equipo 2 no pertenece al torneo especificado');
    expect(matchRepository.matches.length).toBe(0);
  });

  it('should fail if teams are the same', async () => {
    const createMatchDto: CreateMatchDto = {
      tournamentId: 'tournament-1',
      team1Id: 'team-1',
      team2Id: 'team-1',
      scheduledDate,
    };

    const result = await useCase.execute(createMatchDto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Los equipos no pueden ser iguales');
    expect(matchRepository.matches.length).toBe(0);
  });
}); 