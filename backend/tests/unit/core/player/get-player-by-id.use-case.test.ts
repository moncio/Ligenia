import {
  GetPlayerByIdUseCase,
  GetPlayerByIdInput,
} from '../../../../src/core/application/use-cases/player/get-player-by-id.use-case';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Player } from '../../../../src/core/domain/player/player.entity';
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

describe('GetPlayerByIdUseCase', () => {
  let useCase: GetPlayerByIdUseCase;
  let playerRepository: IPlayerRepository;
  let testPlayer: Player;

  beforeEach(() => {
    // Create a test player with a valid UUID
    testPlayer = new Player(
      '123e4567-e89b-12d3-a456-426614174000',
      '123e4567-e89b-12d3-a456-426614174001',
      PlayerLevel.P3,
      30,
      'Spain',
    );

    // Initialize repository with test data
    playerRepository = new MockPlayerRepository([testPlayer]);

    // Initialize use case
    useCase = new GetPlayerByIdUseCase(playerRepository);
  });

  it('should get a player by ID successfully', async () => {
    // Arrange
    const input: GetPlayerByIdInput = {
      id: testPlayer.id,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const player = result.getValue().player;
    expect(player.id).toBe(testPlayer.id);
    expect(player.userId).toBe(testPlayer.userId);
    expect(player.level).toBe(testPlayer.level);
    expect(player.age).toBe(testPlayer.age);
    expect(player.country).toBe(testPlayer.country);
  });

  it('should fail when player does not exist', async () => {
    // Arrange
    const input: GetPlayerByIdInput = {
      id: '123e4567-e89b-12d3-a456-426614174002', // Valid UUID but non-existent player
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Player not found');
  });

  it('should fail with invalid input data', async () => {
    // Arrange
    const input = {
      id: 'not-a-uuid',
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid player ID format');
  });
});
