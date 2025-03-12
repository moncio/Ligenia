import { GetPlayerAllTournamentsStatisticsUseCase } from '../../../../../src/core/use-cases/statistic/get-player-all-tournaments-statistics.use-case';
import { IStatisticRepository } from '../../../../../src/core/domain/interfaces/statistic-repository.interface';
import { IUserRepository } from '../../../../../src/core/domain/interfaces/user-repository.interface';
import { Statistic } from '../../../../../src/core/domain/entities/statistic.entity';
import { User } from '../../../../../src/core/domain/entities/user.entity';
import { GetPlayerAllTournamentsStatisticsDto } from '../../../../../src/core/domain/dtos/get-player-all-tournaments-statistics.dto';
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

describe('GetPlayerAllTournamentsStatisticsUseCase', () => {
  let useCase: GetPlayerAllTournamentsStatisticsUseCase;
  let statisticRepository: MockStatisticRepository;
  let userRepository: MockUserRepository;

  beforeEach(() => {
    statisticRepository = new MockStatisticRepository();
    userRepository = new MockUserRepository();
    
    useCase = new GetPlayerAllTournamentsStatisticsUseCase(
      statisticRepository,
      userRepository
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

  it('should get all statistics for a player across all tournaments', async () => {
    const dto: GetPlayerAllTournamentsStatisticsDto = {
      playerId: 'user-1'
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().length).toBe(2); // user-1 tiene estadísticas en 2 torneos
    expect(result.getValue()[0].playerId).toBe('user-1');
    expect(result.getValue()[1].playerId).toBe('user-1');
    expect(result.getValue()[0].tournamentId).toBe('tournament-1');
    expect(result.getValue()[1].tournamentId).toBe('tournament-2');
  });

  it('should fail if player does not exist', async () => {
    const dto: GetPlayerAllTournamentsStatisticsDto = {
      playerId: 'non-existent-user'
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(false);
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('El jugador no existe');
  });

  it('should return empty array if player has no statistics', async () => {
    // Añadir un usuario sin estadísticas
    userRepository.users.push(
      new User({
        id: 'user-3',
        name: 'Usuario 3',
        email: 'usuario3@example.com',
      })
    );

    const dto: GetPlayerAllTournamentsStatisticsDto = {
      playerId: 'user-3'
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeDefined();
    expect(result.getValue().length).toBe(0);
  });

  it('should aggregate statistics correctly across tournaments', async () => {
    const dto: GetPlayerAllTournamentsStatisticsDto = {
      playerId: 'user-1'
    };

    const result = await useCase.execute(dto);

    expect(result.isSuccess).toBe(true);
    
    // Verificar que las estadísticas de cada torneo son correctas
    const tournament1Stats = result.getValue().find(stat => stat.tournamentId === 'tournament-1');
    const tournament2Stats = result.getValue().find(stat => stat.tournamentId === 'tournament-2');
    
    expect(tournament1Stats).toBeDefined();
    expect(tournament2Stats).toBeDefined();
    
    expect(tournament1Stats?.wins).toBe(5);
    expect(tournament1Stats?.losses).toBe(2);
    expect(tournament1Stats?.winningPercentage).toBeCloseTo(71.43);
    
    expect(tournament2Stats?.wins).toBe(6);
    expect(tournament2Stats?.losses).toBe(1);
    expect(tournament2Stats?.winningPercentage).toBeCloseTo(85.71);
    
    // Total de victorias y derrotas en ambos torneos
    const totalWins = tournament1Stats!.wins + tournament2Stats!.wins;
    const totalLosses = tournament1Stats!.losses + tournament2Stats!.losses;
    
    expect(totalWins).toBe(11);
    expect(totalLosses).toBe(3);
  });
}); 