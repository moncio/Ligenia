import {
  UpdateRankingsAfterMatchUseCase,
  UpdateRankingsAfterMatchInput,
} from '../../../../src/core/application/use-cases/ranking/update-rankings-after-match.use-case';
import { CalculatePlayerRankingsUseCase } from '../../../../src/core/application/use-cases/ranking/calculate-player-rankings.use-case';
import { IRankingRepository } from '../../../../src/core/application/interfaces/repositories/ranking.repository';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { IStatisticRepository } from '../../../../src/core/application/interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../../../src/core/application/interfaces/repositories/player.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { Ranking } from '../../../../src/core/domain/ranking/ranking.entity';
import { Player } from '../../../../src/core/domain/player/player.entity';
import { Statistic } from '../../../../src/core/domain/statistic/statistic.entity';
import { PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';
import { Result } from '../../../../src/shared/result';

// Define MatchType enum here since it might not be exported from match.entity.ts
enum MatchType {
  SINGLES = 'SINGLES',
  DOUBLES = 'DOUBLES',
}

// Mock repositories
class MockRankingRepository implements IRankingRepository {
  private rankings: Ranking[] = [];

  constructor(initialRankings: Ranking[] = []) {
    this.rankings = initialRankings;
  }

  async findById(id: string): Promise<Ranking | null> {
    return this.rankings.find(r => r.id === id) || null;
  }

  async findByPlayerId(playerId: string): Promise<Ranking | null> {
    return this.rankings.find(r => r.playerId === playerId) || null;
  }

  async findAll(options?: any): Promise<Ranking[]> {
    return this.rankings;
  }

  async count(options?: any): Promise<number> {
    return this.rankings.length;
  }

  async save(ranking: Ranking): Promise<void> {
    this.rankings.push(ranking);
  }

  async update(ranking: Ranking): Promise<void> {
    const index = this.rankings.findIndex(r => r.id === ranking.id);
    if (index !== -1) {
      this.rankings[index] = ranking;
    }
  }

  async delete(id: string): Promise<boolean> {
    const index = this.rankings.findIndex(r => r.id === id);
    if (index !== -1) {
      this.rankings.splice(index, 1);
      return true;
    }
    return false;
  }

  async findByPlayerLevel(playerLevel: PlayerLevel, options?: any): Promise<Ranking[]> {
    return this.rankings.filter(r => r.playerLevel === playerLevel);
  }

  async countByPlayerLevel(playerLevel: PlayerLevel): Promise<number> {
    return this.rankings.filter(r => r.playerLevel === playerLevel).length;
  }
}

class MockMatchRepository implements IMatchRepository {
  private matches: Match[] = [];

  constructor(initialMatches: Match[] = []) {
    this.matches = initialMatches;
  }

  async findById(id: string): Promise<Match | null> {
    return this.matches.find(m => m.id === id) || null;
  }

  async findAll(options?: any): Promise<Match[]> {
    return this.matches;
  }

  async count(options?: any): Promise<number> {
    return this.matches.length;
  }

  async save(match: Match): Promise<void> {
    this.matches.push(match);
  }

  async update(match: Match): Promise<void> {
    const index = this.matches.findIndex(m => m.id === match.id);
    if (index !== -1) {
      this.matches[index] = match;
    }
  }

  async delete(id: string): Promise<boolean> {
    const index = this.matches.findIndex(m => m.id === id);
    if (index !== -1) {
      this.matches.splice(index, 1);
      return true;
    }
    return false;
  }

  async findByTournamentId(tournamentId: string, options?: any): Promise<Match[]> {
    return this.matches.filter(m => m.tournamentId === tournamentId);
  }

  async findByPlayerId(playerId: string, options?: any): Promise<Match[]> {
    return this.matches.filter(
      m =>
        m.homePlayerOneId === playerId ||
        m.homePlayerTwoId === playerId ||
        m.awayPlayerOneId === playerId ||
        m.awayPlayerTwoId === playerId,
    );
  }

  // Implement additional required methods
  async findByFilter(filter: any): Promise<Match[]> {
    return this.matches;
  }

  async findByTournamentAndRound(tournamentId: string, round: number): Promise<Match[]> {
    return this.matches.filter(m => m.tournamentId === tournamentId && m.round === round);
  }

  async tournamentHasMatches(tournamentId: string): Promise<boolean> {
    return this.matches.some(m => m.tournamentId === tournamentId);
  }
}

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

  async findAll(options?: any): Promise<Player[]> {
    return this.players;
  }

  async count(): Promise<number> {
    return this.players.length;
  }

  async findByLevel(level: PlayerLevel): Promise<Player[]> {
    return this.players.filter(p => p.level === level);
  }

  async save(player: Player): Promise<void> {
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

class MockStatisticRepository implements IStatisticRepository {
  private statistics: Statistic[] = [];

  constructor(initialStatistics: Statistic[] = []) {
    this.statistics = initialStatistics;
  }

  async findById(id: string): Promise<Statistic | null> {
    return this.statistics.find(s => s.id === id) || null;
  }

  async findByPlayerId(playerId: string): Promise<Statistic | null> {
    return this.statistics.find(s => s.playerId === playerId) || null;
  }

  async findAll(): Promise<Statistic[]> {
    return this.statistics;
  }

  async count(): Promise<number> {
    return this.statistics.length;
  }

  async save(statistic: Statistic): Promise<void> {
    this.statistics.push(statistic);
  }

  async update(statistic: Statistic): Promise<void> {
    const index = this.statistics.findIndex(s => s.id === statistic.id);
    if (index !== -1) {
      this.statistics[index] = statistic;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.statistics.findIndex(s => s.id === id);
    if (index !== -1) {
      this.statistics.splice(index, 1);
    }
  }

  async findByTournamentId(tournamentId: string): Promise<Statistic[]> {
    return this.statistics;
  }
}

// Mock CalculatePlayerRankingsUseCase
class MockCalculatePlayerRankingsUseCase extends CalculatePlayerRankingsUseCase {
  private successfulPlayerIds: string[];

  constructor(successfulPlayerIds: string[]) {
    super(null as any, null as any, null as any);
    this.successfulPlayerIds = successfulPlayerIds;
  }

  async execute(input: { playerId?: string }): Promise<Result<any>> {
    if (!input.playerId) {
      return Result.fail(new Error('Player ID is required'));
    }

    if (this.successfulPlayerIds.includes(input.playerId)) {
      return Result.ok({
        rankings: [
          new Ranking(
            'mock-ranking-id',
            input.playerId,
            50,
            1,
            1,
            PlayerLevel.P3.toString(),
            null,
            0,
            new Date(),
            new Date(),
            new Date(),
          ),
        ],
      });
    }
    return Result.fail(new Error(`Failed to calculate rankings for player ${input.playerId}`));
  }
}

describe('UpdateRankingsAfterMatchUseCase', () => {
  // Repository mocks
  let rankingRepository: IRankingRepository;
  let matchRepository: IMatchRepository;
  let calculatePlayerRankingsUseCase: CalculatePlayerRankingsUseCase;

  // Use case
  let useCase: UpdateRankingsAfterMatchUseCase;

  // Test data - Players
  const homePlayer1Id = '123e4567-e89b-12d3-a456-426614174001';
  const homePlayer2Id = '123e4567-e89b-12d3-a456-426614174002';
  const awayPlayer1Id = '123e4567-e89b-12d3-a456-426614174003';
  const awayPlayer2Id = '123e4567-e89b-12d3-a456-426614174004';

  // Test data - Matches
  const completedMatchId = '123e4567-e89b-12d3-a456-426614174010';
  const pendingMatchId = '123e4567-e89b-12d3-a456-426614174011';

  const completedMatch = new Match(
    completedMatchId,
    'tournament-1',
    homePlayer1Id,
    homePlayer2Id,
    awayPlayer1Id,
    awayPlayer2Id,
    1, // Round
    new Date(), // Match date
    'Test Location', // Location
    MatchStatus.COMPLETED,
    3, // Home score
    1, // Away score
    new Date(),
    new Date(),
  );

  const pendingMatch = new Match(
    pendingMatchId,
    'tournament-1',
    homePlayer1Id,
    null, // No second home player (singles)
    awayPlayer1Id,
    null, // No second away player (singles)
    1, // Round
    new Date('2023-06-02'), // Match date
    'Test Location', // Location
    MatchStatus.PENDING,
    null, // No score yet
    null, // No score yet
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    // Initialize repositories with test data
    matchRepository = new MockMatchRepository([completedMatch, pendingMatch]);
    rankingRepository = new MockRankingRepository([]);

    // Create a mock CalculatePlayerRankingsUseCase that succeeds for all players
    calculatePlayerRankingsUseCase = new MockCalculatePlayerRankingsUseCase([
      homePlayer1Id,
      homePlayer2Id,
      awayPlayer1Id,
      awayPlayer2Id,
    ]);

    useCase = new UpdateRankingsAfterMatchUseCase(
      rankingRepository,
      matchRepository,
      calculatePlayerRankingsUseCase,
    );
  });

  it('should update rankings for all players in a completed match', async () => {
    // Arrange
    const input: UpdateRankingsAfterMatchInput = { matchId: completedMatchId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.matchId).toBe(completedMatchId);
    expect(output.playersUpdated.length).toBe(4); // All 4 players were updated

    // All player IDs should be in the updated list
    expect(output.playersUpdated).toContain(homePlayer1Id);
    expect(output.playersUpdated).toContain(homePlayer2Id);
    expect(output.playersUpdated).toContain(awayPlayer1Id);
    expect(output.playersUpdated).toContain(awayPlayer2Id);
  });

  it('should fail when trying to update rankings for a non-completed match', async () => {
    // Arrange
    const input: UpdateRankingsAfterMatchInput = { matchId: pendingMatchId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Cannot update rankings for a match that is not completed',
    );
  });

  it('should fail when match not found', async () => {
    // Arrange
    const nonExistentMatchId = '123e4567-e89b-12d3-a456-426614174099';
    const input: UpdateRankingsAfterMatchInput = { matchId: nonExistentMatchId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Match not found');
  });

  it('should only update rankings for players that calculate successfully', async () => {
    // Arrange
    // Mock calculatePlayerRankingsUseCase to only succeed for home players
    calculatePlayerRankingsUseCase = new MockCalculatePlayerRankingsUseCase([
      homePlayer1Id,
      homePlayer2Id,
    ]);

    useCase = new UpdateRankingsAfterMatchUseCase(
      rankingRepository,
      matchRepository,
      calculatePlayerRankingsUseCase,
    );

    const input: UpdateRankingsAfterMatchInput = { matchId: completedMatchId };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.playersUpdated.length).toBe(2); // Only home players updated
    expect(output.playersUpdated).toContain(homePlayer1Id);
    expect(output.playersUpdated).toContain(homePlayer2Id);
    expect(output.playersUpdated).not.toContain(awayPlayer1Id);
    expect(output.playersUpdated).not.toContain(awayPlayer2Id);
  });

  it('should handle singles matches correctly', async () => {
    // Arrange
    const singlesMatch = new Match(
      '123e4567-e89b-12d3-a456-426614174012',
      'tournament-1',
      homePlayer1Id,
      null, // No second home player
      awayPlayer1Id,
      null, // No second away player
      1, // Round
      new Date('2023-06-03'), // Match date
      'Test Location', // Location
      MatchStatus.COMPLETED,
      10, // Home score
      5, // Away score
      new Date(),
      new Date(),
    );

    matchRepository = new MockMatchRepository([singlesMatch]);

    useCase = new UpdateRankingsAfterMatchUseCase(
      rankingRepository,
      matchRepository,
      calculatePlayerRankingsUseCase,
    );

    const input: UpdateRankingsAfterMatchInput = {
      matchId: '123e4567-e89b-12d3-a456-426614174012',
    };

    // Act
    const result = await useCase.execute(input);

    // Assert
    expect(result.isSuccess()).toBe(true);

    const output = result.getValue();
    expect(output.playersUpdated.length).toBe(2); // Only 2 players in singles
    expect(output.playersUpdated).toContain(homePlayer1Id);
    expect(output.playersUpdated).toContain(awayPlayer1Id);
    // Should not include the null players
    expect(output.playersUpdated).not.toContain(null);
  });

  it('should fail with invalid match ID format', async () => {
    // Arrange
    const invalidInput = { matchId: 'not-a-uuid' };

    // Act
    const result = await useCase.execute(invalidInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid match ID format');
  });
});
