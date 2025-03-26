import {
  UpdatePlayerProfileUseCase,
  UpdatePlayerProfileInput,
} from '../../../../src/core/application/use-cases/player/update-player-profile.use-case';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';

// Mock Player Repository
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

  async findAll(): Promise<Player[]> {
    return this.players;
  }

  async count(): Promise<number> {
    return this.players.length;
  }

  async findByLevel(level: PlayerLevel): Promise<Player[]> {
    return this.players.filter(p => p.level === level);
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

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async count(): Promise<number> {
    return this.users.length;
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

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

describe('UpdatePlayerProfileUseCase', () => {
  let useCase: UpdatePlayerProfileUseCase;
  let playerRepository: IPlayerRepository;
  let userRepository: IUserRepository;
  let testPlayer: Player;
  let testUser: User;
  let adminUser: User;

  beforeEach(() => {
    // Create test users with valid UUIDs
    testUser = new User(
      '123e4567-e89b-12d3-a456-426614174001',
      'test@example.com',
      'password',
      'Test User',
      UserRole.PLAYER,
    );

    adminUser = new User(
      '123e4567-e89b-12d3-a456-426614174002',
      'admin@example.com',
      'password',
      'Admin User',
      UserRole.ADMIN,
    );

    // Create a test player with a valid UUID
    testPlayer = new Player(
      '123e4567-e89b-12d3-a456-426614174000',
      testUser.id,
      PlayerLevel.P3,
      30,
      'Spain',
    );

    // Initialize repositories with test data
    playerRepository = new MockPlayerRepository([testPlayer]);
    userRepository = new MockUserRepository([testUser, adminUser]);

    // Initialize use case
    useCase = new UpdatePlayerProfileUseCase(playerRepository, userRepository);
  });

  it('should update a player profile successfully when user is the owner', async () => {
    // Arrange
    const input: UpdatePlayerProfileInput = {
      id: testPlayer.id,
      requestingUserId: testUser.id,
      level: PlayerLevel.P2,
      age: 31,
      country: 'Portugal',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const successResult = result.getValue();
    expect(successResult.success).toBe(true);

    // Verify player was updated in repository
    const updatedPlayer = await playerRepository.findById(testPlayer.id);
    expect(updatedPlayer!.level).toBe(PlayerLevel.P2);
    expect(updatedPlayer!.age).toBe(31);
    expect(updatedPlayer!.country).toBe('Portugal');
  });

  it('should update a player profile successfully when user is an admin', async () => {
    // Arrange
    const input: UpdatePlayerProfileInput = {
      id: testPlayer.id,
      requestingUserId: adminUser.id,
      level: PlayerLevel.P1,
      age: 32,
      country: 'France',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const successResult = result.getValue();
    expect(successResult.success).toBe(true);

    // Verify player was updated in repository
    const updatedPlayer = await playerRepository.findById(testPlayer.id);
    expect(updatedPlayer!.level).toBe(PlayerLevel.P1);
    expect(updatedPlayer!.age).toBe(32);
    expect(updatedPlayer!.country).toBe('France');
  });

  it('should fail when player does not exist', async () => {
    // Arrange
    const input: UpdatePlayerProfileInput = {
      id: '123e4567-e89b-12d3-a456-426614174005', // Valid UUID but non-existent player
      requestingUserId: testUser.id,
      level: PlayerLevel.P2,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Player not found');
  });

  it('should fail when requesting user does not exist', async () => {
    // Arrange
    const input: UpdatePlayerProfileInput = {
      id: testPlayer.id,
      requestingUserId: '123e4567-e89b-12d3-a456-426614174006', // Valid UUID but non-existent user
      level: PlayerLevel.P2,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('User not found');
  });

  it('should fail when user is not authorized to update the profile', async () => {
    // Arrange
    const anotherUser = new User(
      '123e4567-e89b-12d3-a456-426614174003',
      'another@example.com',
      'password',
      'Another User',
      UserRole.PLAYER,
    );
    await userRepository.save(anotherUser);

    const input: UpdatePlayerProfileInput = {
      id: testPlayer.id,
      requestingUserId: anotherUser.id,
      level: PlayerLevel.P2,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Not authorized to update this player profile');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const input = {
      id: 'not-a-uuid',
      requestingUserId: testUser.id,
      level: 'INVALID_LEVEL',
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid player ID format');
  });

  it('should update only the provided fields', async () => {
    // Arrange
    const input: UpdatePlayerProfileInput = {
      id: testPlayer.id,
      requestingUserId: testUser.id,
      level: PlayerLevel.P3,
      age: 35,
      country: 'Spain',
      avatarUrl: 'https://example.com/avatar2.jpg',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const successResult = result.getValue();
    expect(successResult.success).toBe(true);

    // Verify player was updated in repository
    const updatedPlayer = await playerRepository.findById(testPlayer.id);
    expect(updatedPlayer!.level).toBe(PlayerLevel.P3);
    expect(updatedPlayer!.age).toBe(35);
    expect(updatedPlayer!.country).toBe('Spain');
    expect(updatedPlayer!.avatarUrl).toBe('https://example.com/avatar2.jpg');
  });
});
