import { DeletePlayerStatisticsUseCase } from '../../../../../src/core/use-cases/statistic/delete-player-statistics.use-case';
import { IStatisticRepository } from '../../../../../src/core/domain/interfaces/statistic-repository.interface';
import { IUserRepository } from '../../../../../src/core/domain/interfaces/user-repository.interface';
import { ITournamentRepository } from '../../../../../src/core/domain/interfaces/tournament-repository.interface';
import { Statistic } from '../../../../../src/core/domain/entities/statistic.entity';
import { User } from '../../../../../src/core/domain/entities/user.entity';
import { Tournament } from '../../../../../src/core/domain/entities/tournament.entity';
import { DeletePlayerStatisticsDto } from '../../../../../src/core/domain/dtos/delete-player-statistics.dto';
import { TournamentFormat, TournamentStatus } from '@prisma/client';
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

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async create(data: User): Promise<User> {
    this.users.push(data);
    return data;
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return null;
    
    const updatedUser = { ...this.users[index], ...data, updatedAt: new Date() };
    this.users[index] = updatedUser as User;
    return updatedUser as User;
  }

  async delete(id: string): Promise<boolean> {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id !== id);
    return initialLength > this.users.length;
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10 } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = this.users.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        total: this.users.length,
        page,
        limit,
        totalPages: Math.ceil(this.users.length / limit),
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
    
    const updatedTournament = { ...this.tournaments[index], ...data, updatedAt: new Date() };
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
    return this.tournaments.some(
      tournament => tournament.name === name && tournament.leagueId === leagueId
    );
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Tournament>> {
    const { page = 1, limit = 10 } = options;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = this.tournaments.slice(startIndex, endIndex);

    return {
      data,
      pagination: {
        total: this.tournaments.length,
        page,
        limit,
        totalPages: Math.ceil(this.tournaments.length / limit),
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

describe('DeletePlayerStatisticsUseCase', () => {
  let useCase: DeletePlayerStatisticsUseCase;
  let statisticRepository: MockStatisticRepository;
  let userRepository: MockUserRepository;
  let tournamentRepository: MockTournamentRepository;

  beforeEach(() => {
    statisticRepository = new MockStatisticRepository();
    userRepository = new MockUserRepository();
    tournamentRepository = new MockTournamentRepository();
    
    useCase = new DeletePlayerStatisticsUseCase(
      statisticRepository,
      userRepository,
      tournamentRepository
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

    // Añadir estadísticas para las pruebas
    statisticRepository.statistics.push(
      new Statistic({
        id: 'statistic-1',
        playerId: 'user-1',
        tournamentId: 'tournament-1',
        points: 100,
        wins: 5,
        losses: 2,
        setsWon: 12,
        setsLost: 6,
        gamesWon: 72,
        gamesLost: 48,
        winningPercentage: 71.43,
      }),
      new Statistic({
        id: 'statistic-2',
        playerId: 'user-2',
        tournamentId: 'tournament-1',
        points: 80,
        wins: 4,
        losses: 3,
        setsWon: 10,
        setsLost: 8,
        gamesWon: 65,
        gamesLost: 55,
        winningPercentage: 57.14,
      }),
      new Statistic({
        id: 'statistic-3',
        playerId: 'user-1',
        tournamentId: 'tournament-2',
        points: 120,
        wins: 6,
        losses: 1,
        setsWon: 13,
        setsLost: 4,
        gamesWon: 78,
        gamesLost: 42,
        winningPercentage: 85.71,
      })
    );
  });

  it('should delete statistics for a player in a tournament', async () => {
    const dto: DeletePlayerStatisticsDto = {
      playerId: 'user-1',
      tournamentId: 'tournament-1'
    };

    const initialCount = statisticRepository.statistics.length;
    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe(true);
    expect(statisticRepository.statistics.length).toBe(initialCount - 1);
    expect(statisticRepository.statistics.find(s => s.id === 'statistic-1')).toBeUndefined();
  });

  it('should fail if player does not exist', async () => {
    const dto: DeletePlayerStatisticsDto = {
      playerId: 'non-existent-user',
      tournamentId: 'tournament-1'
    };

    const initialCount = statisticRepository.statistics.length;
    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El jugador no existe');
    expect(statisticRepository.statistics.length).toBe(initialCount);
  });

  it('should fail if tournament does not exist', async () => {
    const dto: DeletePlayerStatisticsDto = {
      playerId: 'user-1',
      tournamentId: 'non-existent-tournament'
    };

    const initialCount = statisticRepository.statistics.length;
    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El torneo no existe');
    expect(statisticRepository.statistics.length).toBe(initialCount);
  });

  it('should fail if statistics do not exist for the player in the tournament', async () => {
    const dto: DeletePlayerStatisticsDto = {
      playerId: 'user-2',
      tournamentId: 'tournament-2'
    };

    const initialCount = statisticRepository.statistics.length;
    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('No se encontraron estadísticas para este jugador en este torneo');
    expect(statisticRepository.statistics.length).toBe(initialCount);
  });
}); 