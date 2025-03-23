import {
  UpdatePlayerLevelUseCase,
  UpdatePlayerLevelInput,
} from '../../../../src/core/application/use-cases/player/update-player-level.use-case';
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

describe('UpdatePlayerLevelUseCase', () => {
  let useCase: UpdatePlayerLevelUseCase;
  let playerRepository: IPlayerRepository;
  let testPlayer: Player;

  beforeEach(() => {
    // Create a test player with valid UUID
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
    useCase = new UpdatePlayerLevelUseCase(playerRepository);
  });

  it('should update player level successfully', async () => {
    // Arrange
    const input: UpdatePlayerLevelInput = {
      playerId: testPlayer.id,
      level: PlayerLevel.P2,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);

    const { message } = result.getValue();
    expect(message).toContain('Player level updated to P2 successfully');

    // Verify that player was actually updated
    const updatedPlayer = await playerRepository.findById(testPlayer.id);
    expect(updatedPlayer?.level).toBe(PlayerLevel.P2);
  });

  it('should fail when player does not exist', async () => {
    // Arrange
    const input: UpdatePlayerLevelInput = {
      playerId: '123e4567-e89b-12d3-a456-426614174999', // non-existent player ID
      level: PlayerLevel.P1,
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Player not found');
  });

  it('should fail with invalid player ID format', async () => {
    // Arrange
    const input = {
      playerId: 'not-a-uuid',
      level: PlayerLevel.P1,
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid player ID format');
  });

  it('should fail with invalid player level', async () => {
    // Arrange
    const input = {
      playerId: testPlayer.id,
      level: 'INVALID_LEVEL',
    };

    // Act
    // @ts-ignore - deliberately passing invalid input
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid player level');
  });
});
