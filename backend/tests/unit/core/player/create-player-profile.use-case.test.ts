import { CreatePlayerProfileUseCase, CreatePlayerProfileInput } from '../../../../src/core/application/use-cases/player/create-player-profile.use-case';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock Player Repository
class MockPlayerRepository implements IPlayerRepository {
  private players: Player[] = [];

  async findById(id: string): Promise<Player | null> {
    return this.players.find(p => p.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Player | null> {
    return this.players.find(p => p.userId === userId) || null;
  }

  async findAll(): Promise<Player[]> {
    return this.players;
  }

  async count(): Promise<number> {
    return this.players.length;
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

// Mock User Repository
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(u => u.email === email) || null;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }
}

describe('CreatePlayerProfileUseCase', () => {
  let useCase: CreatePlayerProfileUseCase;
  let playerRepository: IPlayerRepository;
  let userRepository: IUserRepository;
  let testUser: User;

  beforeEach(() => {
    // Create a test user with a valid UUID format
    testUser = new User(
      '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
      'test@example.com',
      'password',
      'Test User',
      UserRole.PLAYER
    );

    // Initialize repositories with test data
    playerRepository = new MockPlayerRepository();
    userRepository = new MockUserRepository([testUser]);

    // Initialize use case
    useCase = new CreatePlayerProfileUseCase(playerRepository, userRepository);
  });

  it('should create a player profile successfully', async () => {
    // Arrange
    const input: CreatePlayerProfileInput = {
      userId: testUser.id,
      level: PlayerLevel.P3,
      age: 30,
      country: 'Spain'
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    
    const player = result.getValue().player;
    expect(player.id).toBeDefined();
    expect(player.userId).toBe(testUser.id);
    expect(player.level).toBe(PlayerLevel.P3);
    expect(player.age).toBe(30);
    expect(player.country).toBe('Spain');
  });

  it('should fail when user does not exist', async () => {
    // Arrange
    const input: CreatePlayerProfileInput = {
      userId: '123e4567-e89b-12d3-a456-426614174001', // Different valid UUID
      level: PlayerLevel.P3
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('User not found');
  });

  it('should fail when player profile already exists for the user', async () => {
    // Arrange
    const existingPlayer = new Player(
      'player-1',
      testUser.id,
      PlayerLevel.P3
    );
    await playerRepository.save(existingPlayer);

    const input: CreatePlayerProfileInput = {
      userId: testUser.id,
      level: PlayerLevel.P2
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Player profile already exists for this user');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const input = {
      userId: 'invalid-uuid', // Not a valid UUID
      level: 'invalid-level' // Not a valid PlayerLevel
    } as any;

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid');
  });

  it('should create a player with minimal required fields', async () => {
    // Arrange
    const input: CreatePlayerProfileInput = {
      userId: testUser.id,
      level: PlayerLevel.P3
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    
    const player = result.getValue().player;
    expect(player.userId).toBe(testUser.id);
    expect(player.level).toBe(PlayerLevel.P3);
    expect(player.age).toBeNull();
    expect(player.country).toBeNull();
    expect(player.avatarUrl).toBeNull();
  });
}); 