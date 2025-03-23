import {
  ListPlayersUseCase,
  ListPlayersInput,
} from '../../../../src/core/application/use-cases/player/list-players.use-case';
import {
  IPlayerRepository,
  PaginationOptions,
  PlayerFilter,
} from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock Player Repository with advanced findAll implementation
class MockPlayerRepository implements IPlayerRepository {
  private players: Player[] = [];

  constructor(initialPlayers: Player[] = []) {
    this.players = initialPlayers;
  }

  async findById(id: string): Promise<Player | null> {
    return this.players.find(p => p.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    return this.players.find(p => p.userId === userId) || null;
  }

  async findAll(filter?: PlayerFilter, pagination?: PaginationOptions): Promise<Player[]> {
    let result = [...this.players];

    // Apply filters
    if (filter) {
      if (filter.level !== undefined) {
        result = result.filter(p => p.level === filter.level);
      }
      if (filter.country !== undefined) {
        result = result.filter(p => p.country === filter.country);
      }
      if (filter.userId !== undefined) {
        result = result.filter(p => p.userId === filter.userId);
      }
      if (filter.searchTerm !== undefined) {
        const searchTerm = filter.searchTerm.toLowerCase();
        result = result.filter(
          p =>
            p.country?.toLowerCase().includes(searchTerm) ||
            p.id.toLowerCase().includes(searchTerm),
        );
      }
    }

    // Apply sorting
    if (pagination?.sort) {
      const { field, order } = pagination.sort;
      result.sort((a: any, b: any) => {
        if (a[field] < b[field]) return order === 'asc' ? -1 : 1;
        if (a[field] > b[field]) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    if (pagination) {
      result = result.slice(pagination.skip, pagination.skip + pagination.limit);
    }

    return result;
  }

  async count(filter?: PlayerFilter): Promise<number> {
    let result = [...this.players];

    // Apply filters
    if (filter) {
      if (filter.level !== undefined) {
        result = result.filter(p => p.level === filter.level);
      }
      if (filter.country !== undefined) {
        result = result.filter(p => p.country === filter.country);
      }
      if (filter.userId !== undefined) {
        result = result.filter(p => p.userId === filter.userId);
      }
      if (filter.searchTerm !== undefined) {
        const searchTerm = filter.searchTerm.toLowerCase();
        result = result.filter(
          p =>
            p.country?.toLowerCase().includes(searchTerm) ||
            p.id.toLowerCase().includes(searchTerm),
        );
      }
    }

    return result.length;
  }

  async save(player: Player): Promise<void> {
    player.id = `player-${this.players.length + 1}`;
    this.players.push(player);
  }

  async update(player: Player): Promise<void> {
    const index = this.players.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.players[index] = player;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.players.findIndex(p => p.id === id);
    if (index !== -1) {
      this.players.splice(index, 1);
    }
  }
}

describe('ListPlayersUseCase', () => {
  let useCase: ListPlayersUseCase;
  let playerRepository: IPlayerRepository;
  let testPlayers: Player[];

  beforeEach(() => {
    // Create test players with valid UUIDs
    testPlayers = [
      new Player(
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001',
        PlayerLevel.P3,
        30,
        'Spain',
      ),
      new Player(
        '123e4567-e89b-12d3-a456-426614174002',
        '123e4567-e89b-12d3-a456-426614174003',
        PlayerLevel.P2,
        25,
        'France',
      ),
      new Player(
        '123e4567-e89b-12d3-a456-426614174004',
        '123e4567-e89b-12d3-a456-426614174005',
        PlayerLevel.P1,
        28,
        'Germany',
      ),
      new Player(
        '123e4567-e89b-12d3-a456-426614174006',
        '123e4567-e89b-12d3-a456-426614174007',
        PlayerLevel.P3,
        32,
        'Italy',
      ),
      new Player(
        '123e4567-e89b-12d3-a456-426614174008',
        '123e4567-e89b-12d3-a456-426614174009',
        PlayerLevel.P2,
        27,
        'Spain',
      ),
    ];

    // Initialize repository with test data
    playerRepository = new MockPlayerRepository(testPlayers);

    // Initialize use case
    useCase = new ListPlayersUseCase(playerRepository);
  });

  it('should list all players with default pagination', async () => {
    // Arrange
    const input: ListPlayersInput = {};

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { players, total, skip, limit } = result.getValue();
    expect(players).toHaveLength(5);
    expect(total).toBe(5);
    expect(skip).toBe(0);
    expect(limit).toBe(10);
  });

  it('should filter players by level', async () => {
    // Arrange
    const input: ListPlayersInput = {
      level: PlayerLevel.P3,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { players, total } = result.getValue();
    expect(players).toHaveLength(2);
    expect(total).toBe(2);
    expect(players.every(p => p.level === PlayerLevel.P3)).toBe(true);
  });

  it('should filter players by country', async () => {
    // Arrange
    const input: ListPlayersInput = {
      country: 'Spain',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { players, total } = result.getValue();
    expect(players).toHaveLength(2);
    expect(total).toBe(2);
    expect(players.every(p => p.country === 'Spain')).toBe(true);
  });

  it('should apply pagination correctly', async () => {
    // Arrange
    const input: ListPlayersInput = {
      skip: 2,
      limit: 2,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { players, total, skip, limit } = result.getValue();
    expect(players).toHaveLength(2);
    expect(total).toBe(5);
    expect(skip).toBe(2);
    expect(limit).toBe(2);
  });

  it('should apply sorting correctly', async () => {
    // Arrange
    const input: ListPlayersInput = {
      sortField: 'age',
      sortOrder: 'desc',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { players } = result.getValue();
    expect(players[0].age).toBe(32); // Oldest player first
    expect(players[players.length - 1].age).toBe(25); // Youngest player last
  });

  it('should filter by search term', async () => {
    // Arrange
    const input: ListPlayersInput = {
      searchTerm: 'Spain',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { players, total } = result.getValue();
    expect(players).toHaveLength(2);
    expect(total).toBe(2);
    expect(players.every(p => p.country === 'Spain')).toBe(true);
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const input = {
      limit: -5, // Invalid negative limit
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
  });
});
