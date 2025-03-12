import { CreateTeamUseCase } from '../../../../../src/core/use-cases/team/create-team.use-case';
import { ITeamRepository } from '../../../../../src/core/domain/interfaces/team-repository.interface';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Team } from '../../../../../src/core/domain/entities/team.entity';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { CreateTeamDto } from '../../../../../src/core/domain/dtos/create-team.dto';
import { TournamentFormat, TournamentStatus } from '@prisma/client';

// Mock del repositorio de equipos
class MockTeamRepository implements ITeamRepository {
  teams: Team[] = [];

  async findById(id: string): Promise<Team | null> {
    return this.teams.find(team => team.id === id) || null;
  }

  async findAll(): Promise<Team[]> {
    return this.teams;
  }

  async create(data: Omit<Team, 'id'>): Promise<Team> {
    const team = new Team({
      id: `team-${this.teams.length + 1}`,
      ...data,
    });
    this.teams.push(team);
    return team;
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

  async findPaginated(): Promise<any> {
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

  async create(data: Omit<Tournament, 'id'>): Promise<Tournament> {
    const tournament = new Tournament({
      id: `tournament-${this.tournaments.length + 1}`,
      ...data,
    });
    this.tournaments.push(tournament);
    return tournament;
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

  async findPaginated(): Promise<any> {
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
}

describe('CreateTeamUseCase', () => {
  let useCase: CreateTeamUseCase;
  let teamRepository: MockTeamRepository;
  let tournamentRepository: MockTournamentRepository;

  beforeEach(() => {
    teamRepository = new MockTeamRepository();
    tournamentRepository = new MockTournamentRepository();
    useCase = new CreateTeamUseCase(teamRepository, tournamentRepository);

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
  });

  it('should create a team successfully', async () => {
    const createTeamDto: CreateTeamDto = {
      name: 'New Team',
      tournamentId: 'tournament-1',
      players: ['player1', 'player2'],
      ranking: 100,
      logoUrl: 'https://example.com/logo.png',
    };

    const result = await useCase.execute(createTeamDto);

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.name).toBe(createTeamDto.name);
    expect(result.data?.tournamentId).toBe(createTeamDto.tournamentId);
    expect(result.data?.players).toEqual(createTeamDto.players);
    expect(teamRepository.teams.length).toBe(1);
  });

  it('should fail if tournament does not exist', async () => {
    const createTeamDto: CreateTeamDto = {
      name: 'New Team',
      tournamentId: 'non-existent-tournament',
      players: ['player1', 'player2'],
    };

    const result = await useCase.execute(createTeamDto);

    expect(result.success).toBe(false);
    expect(result.error).toBe('El torneo especificado no existe');
    expect(teamRepository.teams.length).toBe(0);
  });

  it('should fail if team name already exists in tournament', async () => {
    // Add an existing team
    teamRepository.teams.push(
      new Team({
        id: 'team-1',
        name: 'Existing Team',
        tournamentId: 'tournament-1',
        players: ['player1', 'player2'],
      })
    );

    const createTeamDto: CreateTeamDto = {
      name: 'Existing Team',
      tournamentId: 'tournament-1',
      players: ['player3', 'player4'],
    };

    const result = await useCase.execute(createTeamDto);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Ya existe un equipo con ese nombre en el torneo');
    expect(teamRepository.teams.length).toBe(1);
  });

  it('should fail if team validation fails', async () => {
    const createTeamDto: CreateTeamDto = {
      name: '',
      tournamentId: 'tournament-1',
      players: ['player1', 'player2'],
    };

    const result = await useCase.execute(createTeamDto);

    expect(result.success).toBe(false);
    expect(result.error).toBe('El nombre del equipo es obligatorio');
    expect(teamRepository.teams.length).toBe(0);
  });
}); 