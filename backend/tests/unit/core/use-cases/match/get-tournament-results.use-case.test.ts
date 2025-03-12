import { GetTournamentResultsUseCase } from '../../../../../src/core/use-cases/match/get-tournament-results.use-case';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Match, MatchScore } from '../../../../../src/core/domain/entities/match.entity';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { MatchStatus, TournamentFormat, TournamentStatus } from '@prisma/client';
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

describe('GetTournamentResultsUseCase', () => {
  let useCase: GetTournamentResultsUseCase;
  let matchRepository: MockMatchRepository;
  let tournamentRepository: MockTournamentRepository;

  beforeEach(() => {
    matchRepository = new MockMatchRepository();
    tournamentRepository = new MockTournamentRepository();
    useCase = new GetTournamentResultsUseCase(matchRepository, tournamentRepository);

    // Añadir torneos para las pruebas
    tournamentRepository.tournaments.push(
      new Tournament({
        id: 'tournament-1',
        name: 'Torneo 1',
        leagueId: 'league-1',
        format: TournamentFormat.SINGLE_ELIMINATION,
        status: TournamentStatus.ACTIVE,
        startDate: new Date(),
      }),
      new Tournament({
        id: 'tournament-2',
        name: 'Torneo 2',
        leagueId: 'league-1',
        format: TournamentFormat.ROUND_ROBIN,
        status: TournamentStatus.ACTIVE,
        startDate: new Date(),
      })
    );

    // Añadir partidos para las pruebas
    matchRepository.matches.push(
      new Match({
        id: 'match-1',
        tournamentId: 'tournament-1',
        team1Id: 'team-1',
        team2Id: 'team-2',
        scheduledDate: new Date(),
        status: MatchStatus.COMPLETED,
        score: {
          sets: [
            { team1: 6, team2: 4 },
            { team1: 6, team2: 3 }
          ]
        }
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
            { team1: 7, team2: 5 },
            { team1: 6, team2: 4 }
          ]
        }
      }),
      new Match({
        id: 'match-3',
        tournamentId: 'tournament-1',
        team1Id: 'team-1',
        team2Id: 'team-3',
        scheduledDate: new Date(),
        status: MatchStatus.SCHEDULED,
      }),
      new Match({
        id: 'match-4',
        tournamentId: 'tournament-2',
        team1Id: 'team-5',
        team2Id: 'team-6',
        scheduledDate: new Date(),
        status: MatchStatus.COMPLETED,
        score: {
          sets: [
            { team1: 6, team2: 2 },
            { team1: 6, team2: 1 }
          ]
        }
      })
    );
  });

  it('should get all completed matches with results for a tournament', async () => {
    const result = await useCase.execute('tournament-1');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().length).toBe(2);
    expect(result.getValue()[0].id).toBe('match-1');
    expect(result.getValue()[1].id).toBe('match-2');
    expect(result.getValue()[0].score).toBeDefined();
    expect(result.getValue()[1].score).toBeDefined();
  });

  it('should return empty array if tournament has no completed matches', async () => {
    // Añadir un torneo sin partidos completados
    tournamentRepository.tournaments.push(
      new Tournament({
        id: 'tournament-3',
        name: 'Torneo 3',
        leagueId: 'league-1',
        format: TournamentFormat.SINGLE_ELIMINATION,
        status: TournamentStatus.ACTIVE,
        startDate: new Date(),
      })
    );

    const result = await useCase.execute('tournament-3');

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().length).toBe(0);
  });

  it('should fail if tournament does not exist', async () => {
    const result = await useCase.execute('non-existent-tournament');

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El torneo no existe');
  });
}); 