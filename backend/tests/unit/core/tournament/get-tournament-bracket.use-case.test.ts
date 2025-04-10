import {
  GetTournamentBracketUseCase,
  GetTournamentBracketInput,
} from '../../../../src/core/application/use-cases/tournament/get-tournament-bracket.use-case';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import {
  Tournament,
  TournamentFormat,
  TournamentStatus,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { v4 as uuidv4 } from 'uuid';

// Mock repositories
const mockTournamentRepository: jest.Mocked<ITournamentRepository> = {
  findById: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countParticipants: jest.fn(),
  registerParticipant: jest.fn(),
  unregisterParticipant: jest.fn(),
  isParticipantRegistered: jest.fn(),
  getParticipants: jest.fn(),
  countParticipantsByTournamentId: jest.fn(),
};

const mockMatchRepository: jest.Mocked<IMatchRepository> = {
  findById: jest.fn(),
  findByFilter: jest.fn(),
  findByTournamentAndRound: jest.fn(),
  findByPlayerId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  tournamentHasMatches: jest.fn(),
  count: jest.fn(),
};

describe('GetTournamentBracketUseCase', () => {
  let useCase: GetTournamentBracketUseCase;

  // Test constants
  const tournamentId = 'b8f8225b-65a3-4366-b33a-dcfec72a0cc4';
  const creatorId = '6c45b268-0bb4-4c2f-bde1-60cc075bd633';
  const nonExistingTournamentId = '123e4567-e89b-12d3-a456-426614174999';

  // Player IDs for test matches
  const player1 = 'e5e17a74-1ef6-4e3c-9efc-31e9e82a409e';
  const player2 = '7a07dd47-5baf-48d6-90d5-3c9493078b9b';
  const player3 = '94e9c001-3df1-4ce7-bda7-8cc25df19c23';
  const player4 = 'a70de1e7-8b49-4cc2-a0f7-15a0a3b51eb3';

  beforeEach(() => {
    useCase = new GetTournamentBracketUseCase(mockTournamentRepository, mockMatchRepository);

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock responses
    mockTournamentRepository.findById.mockResolvedValue(createTournament());
    mockMatchRepository.findByFilter.mockResolvedValue([]);
  });

  // Helper function to create a test tournament
  function createTournament(): Tournament {
    const tournament = new Tournament(
      tournamentId,
      'Test Tournament',
      'Test Description',
      new Date(),
      new Date(),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.ACTIVE,
      'Test Location',
      4,
      new Date(),
      PlayerLevel.P1,
      creatorId,
      new Date(),
      new Date(),
    );
    return tournament;
  }

  // Helper function to create a test match
  function createMatch(
    id: string,
    round: number,
    player1Id: string,
    player2Id: string,
    status: MatchStatus = MatchStatus.PENDING,
  ): Match {
    return new Match(
      id,
      tournamentId,
      player1Id,
      player1Id, // Same player for simplicity
      player2Id,
      player2Id, // Same player for simplicity
      round,
      new Date(),
      'Test Location',
      status,
      null,
      null,
    );
  }

  describe('Success cases', () => {
    it('should return tournament bracket with matches grouped by round', async () => {
      // Arrange
      const input: GetTournamentBracketInput = {
        tournamentId,
      };

      // Create sample matches for a 4-player tournament (3 matches total)
      const match1 = createMatch(uuidv4(), 1, player1, player2, MatchStatus.COMPLETED);
      const match2 = createMatch(uuidv4(), 1, player3, player4, MatchStatus.COMPLETED);
      const match3 = createMatch(uuidv4(), 2, player1, player3, MatchStatus.PENDING); // Final match

      // Add scores to completed matches
      match1.updateScore(2, 0);
      match2.updateScore(2, 1);

      mockMatchRepository.findByFilter.mockResolvedValue([match3, match1, match2]); // Randomize order to test sorting

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);

      if (result.isSuccess()) {
        const output = result.getValue();
        expect(output.tournamentId).toBe(tournamentId);
        expect(output.totalMatches).toBe(3);
        expect(output.maxRound).toBe(2);

        // Verify rounds are sorted correctly
        expect(output.rounds.length).toBe(2);
        expect(output.rounds[0].round).toBe(1);
        expect(output.rounds[1].round).toBe(2);

        // Verify matches are grouped correctly
        expect(output.rounds[0].matches.length).toBe(2); // Round 1: two matches
        expect(output.rounds[1].matches.length).toBe(1); // Round 2: one match (final)

        // Verify match details are included
        const finalMatch = output.rounds[1].matches[0];
        expect(finalMatch.round).toBe(2);
        expect(finalMatch.homePlayerOneId).toBe(player1);
        expect(finalMatch.awayPlayerOneId).toBe(player3);
        expect(finalMatch.status).toBe(MatchStatus.PENDING);
      }
    });

    it('should return empty bracket if no matches found', async () => {
      // Arrange
      const input: GetTournamentBracketInput = {
        tournamentId,
      };

      mockMatchRepository.findByFilter.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);

      if (result.isSuccess()) {
        const output = result.getValue();
        expect(output.tournamentId).toBe(tournamentId);
        expect(output.totalMatches).toBe(0);
        expect(output.maxRound).toBe(0);
        expect(output.rounds).toEqual([]);
      }
    });
  });

  describe('Failure cases', () => {
    it('should fail if tournament does not exist', async () => {
      // Arrange
      const input: GetTournamentBracketInput = {
        tournamentId: nonExistingTournamentId,
      };

      mockTournamentRepository.findById.mockResolvedValue(null);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Tournament with ID');
      expect(result.getError().message).toContain('not found');
    });

    it('should fail if input validation fails', async () => {
      // Arrange
      const input = {
        tournamentId: 'invalid-uuid',
      } as GetTournamentBracketInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Invalid input');
    });

    it('should fail if an internal error occurs during execution', async () => {
      // Arrange
      const input: GetTournamentBracketInput = {
        tournamentId,
      };

      // Simulate an error in the repository
      mockMatchRepository.findByFilter.mockRejectedValue(new Error('Database connection error'));

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Database connection error');
    });
  });
});
