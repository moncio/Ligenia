import { UpdatePlayerStatisticsUseCase } from '../../../../../src/core/use-cases/statistic/update-player-statistics.use-case';
import { IStatisticRepository } from '../../../../../src/core/domain/interfaces/statistic-repository.interface';
import { IUserRepository } from '../../../../../src/core/domain/interfaces/user-repository.interface';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { IMatchRepository } from '../../../../../src/core/domain/interfaces/match-repository.interface';
import { Statistic } from '../../../../../src/core/domain/entities/statistic.entity';
import { Match, MatchScore } from '../../../../../src/core/domain/entities/match.entity';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { User } from '../../../../../src/core/domain/entities/user.entity';
import { MatchStatus, TournamentFormat, TournamentStatus } from '@prisma/client';
import { PaginationOptions, PaginatedResult } from '../../../../../src/core/domain/interfaces/repository.interface';

// Mock del repositorio de estadísticas
class MockStatisticRepository implements IStatisticRepository {
  statistics: Statistic[] = [];

  async findById(id: string): Promise<Statistic | null> {
    return this.statistics.find(statistic => statistic.id === id) || null;
  }

  async findAll(): Promise<Statistic[]> {
    return this.statistics;
  }

  async create(data: Statistic): Promise<Statistic> {
    this.statistics.push(data);
    return data;
  }

  async update(id: string, data: Partial<Statistic>): Promise<Statistic | null> {
    const index = this.statistics.findIndex(statistic => statistic.id === id);
    if (index === -1) return null;
    
    const updatedStatistic = { ...this.statistics[index], ...data, updatedAt: new Date() };
    this.statistics[index] = updatedStatistic as Statistic;
    return updatedStatistic as Statistic;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.statistics.length;
    this.statistics = this.statistics.filter(statistic => statistic.id !== id);
    return initialLength > this.statistics.length;
  }

  async findByPlayer(playerId: string): Promise<Statistic[]> {
    return this.statistics.filter(statistic => statistic.playerId === playerId);
  }

  async findByTournament(tournamentId: string): Promise<Statistic[]> {
    return this.statistics.filter(statistic => statistic.tournamentId === tournamentId);
  }

  async findByPlayerAndTournament(playerId: string, tournamentId: string): Promise<Statistic | null> {
    return this.statistics.find(
      statistic => statistic.playerId === playerId && statistic.tournamentId === tournamentId
    ) || null;
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Statistic>> {
    const { page = 1, limit = 10 } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = this.statistics.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        total: this.statistics.length,
        page,
        limit,
        totalPages: Math.ceil(this.statistics.length / limit),
      },
    };
  }

  async count(): Promise<number> {
    return this.statistics.length;
  }

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Statistic>> {
    return this.findPaginated(options);
  }
}

// Mock del repositorio de usuarios
class MockUserRepository implements IUserRepository {
  users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  // Implementación mínima para el test
  async findAll(): Promise<User[]> {
    return this.users;
  }

  async create(data: User): Promise<User> {
    this.users.push(data);
    return data;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    return null;
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<User>> {
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    };
  }

  async count(): Promise<number> {
    return this.users.length;
  }

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<User>> {
    return this.findPaginated(options);
  }
}

// Mock del repositorio de torneos
class MockTournamentRepository implements ITournamentRepository {
  tournaments: Tournament[] = [];

  async findById(id: string): Promise<Tournament | null> {
    return this.tournaments.find(tournament => tournament.id === id) || null;
  }

  // Implementación mínima para el test
  async findAll(): Promise<Tournament[]> {
    return this.tournaments;
  }

  async create(data: Tournament): Promise<Tournament> {
    this.tournaments.push(data);
    return data;
  }

  async update(id: string, data: Partial<Tournament>): Promise<Tournament | null> {
    return null;
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }

  async findByLeague(leagueId: string): Promise<Tournament[]> {
    return [];
  }

  async existsByNameInLeague(name: string, leagueId: string): Promise<boolean> {
    return false;
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Tournament>> {
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
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

// Mock del repositorio de partidos
class MockMatchRepository implements IMatchRepository {
  matches: Match[] = [];

  async findById(id: string): Promise<Match | null> {
    return this.matches.find(match => match.id === id) || null;
  }

  // Implementación mínima para el test
  async findAll(): Promise<Match[]> {
    return this.matches;
  }

  async create(data: Match): Promise<Match> {
    this.matches.push(data);
    return data;
  }

  async update(id: string, data: Partial<Match>): Promise<Match | null> {
    return null;
  }

  async delete(id: string): Promise<boolean> {
    return false;
  }

  async findByTournament(tournamentId: string): Promise<Match[]> {
    return this.matches.filter(match => match.tournamentId === tournamentId);
  }

  async findByTeam(teamId: string): Promise<Match[]> {
    return [];
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Match>> {
    return {
      data: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
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

describe('UpdatePlayerStatisticsUseCase', () => {
  let useCase: UpdatePlayerStatisticsUseCase;
  let statisticRepository: MockStatisticRepository;
  let userRepository: MockUserRepository;
  let tournamentRepository: MockTournamentRepository;
  let matchRepository: MockMatchRepository;

  beforeEach(() => {
    statisticRepository = new MockStatisticRepository();
    userRepository = new MockUserRepository();
    tournamentRepository = new MockTournamentRepository();
    matchRepository = new MockMatchRepository();
    
    useCase = new UpdatePlayerStatisticsUseCase(
      statisticRepository,
      userRepository,
      tournamentRepository,
      matchRepository
    );

    // Añadir usuarios para las pruebas
    userRepository.users.push(
      new User({
        id: 'user-1',
        name: 'Usuario 1',
        email: 'usuario1@example.com',
      }),
      new User({
        id: 'user-2',
        name: 'Usuario 2',
        email: 'usuario2@example.com',
      })
    );

    // Añadir torneos para las pruebas
    tournamentRepository.tournaments.push(
      new Tournament({
        id: 'tournament-1',
        name: 'Torneo 1',
        leagueId: 'league-1',
        format: TournamentFormat.SINGLE_ELIMINATION,
        status: TournamentStatus.ACTIVE,
        startDate: new Date(),
      })
    );

    // Añadir partidos para las pruebas
    matchRepository.matches.push(
      new Match({
        id: 'match-1',
        tournamentId: 'tournament-1',
        team1Id: 'team-1', // Equipo del usuario-1
        team2Id: 'team-2', // Equipo del usuario-2
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
        team1Id: 'team-2', // Equipo del usuario-2
        team2Id: 'team-1', // Equipo del usuario-1
        scheduledDate: new Date(),
        status: MatchStatus.COMPLETED,
        score: {
          sets: [
            { team1: 7, team2: 5 },
            { team1: 6, team2: 4 }
          ]
        }
      })
    );
  });

  it('should create new statistics for a player if they do not exist', async () => {
    const result = await useCase.execute({
      playerId: 'user-1',
      tournamentId: 'tournament-1'
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(statisticRepository.statistics.length).toBe(1);
    expect(result.getValue().playerId).toBe('user-1');
    expect(result.getValue().tournamentId).toBe('tournament-1');
    expect(result.getValue().wins).toBe(1); // Ganó el primer partido
    expect(result.getValue().losses).toBe(1); // Perdió el segundo partido
    expect(result.getValue().setsWon).toBe(2); // Ganó 2 sets en el primer partido
    expect(result.getValue().setsLost).toBe(2); // Perdió 2 sets en el segundo partido
  });

  it('should update existing statistics for a player', async () => {
    // Crear estadísticas existentes
    statisticRepository.statistics.push(
      new Statistic({
        id: 'statistic-1',
        playerId: 'user-1',
        tournamentId: 'tournament-1',
        points: 10,
        wins: 1,
        losses: 0,
        setsWon: 2,
        setsLost: 0,
      })
    );

    const result = await useCase.execute({
      playerId: 'user-1',
      tournamentId: 'tournament-1'
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(statisticRepository.statistics.length).toBe(1);
    expect(result.getValue().id).toBe('statistic-1');
    expect(result.getValue().wins).toBe(1); // Mantiene 1 victoria
    expect(result.getValue().losses).toBe(1); // Añade 1 derrota
    expect(result.getValue().setsWon).toBe(2); // Mantiene 2 sets ganados
    expect(result.getValue().setsLost).toBe(2); // Añade 2 sets perdidos
  });

  it('should fail if player does not exist', async () => {
    const result = await useCase.execute({
      playerId: 'non-existent-user',
      tournamentId: 'tournament-1'
    });

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El jugador no existe');
    expect(statisticRepository.statistics.length).toBe(0);
  });

  it('should fail if tournament does not exist', async () => {
    const result = await useCase.execute({
      playerId: 'user-1',
      tournamentId: 'non-existent-tournament'
    });

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El torneo no existe');
    expect(statisticRepository.statistics.length).toBe(0);
  });

  it('should handle a player with no matches', async () => {
    // Añadir un usuario sin partidos
    userRepository.users.push(
      new User({
        id: 'user-3',
        name: 'Usuario 3',
        email: 'usuario3@example.com',
      })
    );

    const result = await useCase.execute({
      playerId: 'user-3',
      tournamentId: 'tournament-1'
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(statisticRepository.statistics.length).toBe(1);
    expect(result.getValue().playerId).toBe('user-3');
    expect(result.getValue().wins).toBe(0);
    expect(result.getValue().losses).toBe(0);
    expect(result.getValue().setsWon).toBe(0);
    expect(result.getValue().setsLost).toBe(0);
  });
}); 