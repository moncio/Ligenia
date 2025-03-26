import {
  UpdateTournamentMatchesAndStandingsUseCase,
  UpdateTournamentMatchesAndStandingsInput,
} from '../../../../src/core/application/use-cases/tournament/update-tournament-matches-and-standings.use-case';
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

describe('UpdateTournamentMatchesAndStandingsUseCase', () => {
  let useCase: UpdateTournamentMatchesAndStandingsUseCase;

  // Test constants
  const tournamentId = 'b8f8225b-65a3-4366-b33a-dcfec72a0cc4';
  const nonExistingTournamentId = '123e4567-e89b-12d3-a456-426614174999';
  const creatorId = '6c45b268-0bb4-4c2f-bde1-60cc075bd633';

  // Player IDs for test matches
  const player1 = 'e5e17a74-1ef6-4e3c-9efc-31e9e82a409e';
  const player2 = '7a07dd47-5baf-48d6-90d5-3c9493078b9b';
  const player3 = '94e9c001-3df1-4ce7-bda7-8cc25df19c23';
  const player4 = 'a70de1e7-8b49-4cc2-a0f7-15a0a3b51eb3';

  beforeEach(() => {
    useCase = new UpdateTournamentMatchesAndStandingsUseCase(
      mockTournamentRepository,
      mockMatchRepository,
    );

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default mock responses
    mockTournamentRepository.findById.mockResolvedValue(createActiveTournament());
    mockMatchRepository.save.mockImplementation(async match => {
      // Add a generated ID to the match when saved
      if (!match.id) {
        match.id = uuidv4();
      }
      return;
    });
  });

  // Helper function to create a test tournament in ACTIVE state
  function createActiveTournament(): Tournament {
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
    tournamentId: string,
    round: number,
    homePlayerId: string,
    awayPlayerId: string,
    homeScore: number | null = null,
    awayScore: number | null = null,
    status: MatchStatus = MatchStatus.PENDING,
  ): Match {
    const match = new Match(
      id,
      tournamentId,
      homePlayerId,
      homePlayerId, // Same player ID for simplicity
      awayPlayerId,
      awayPlayerId, // Same player ID for simplicity
      round,
      new Date(),
      'Test Location',
      status,
      homeScore,
      awayScore,
    );
    return match;
  }

  describe('Success cases', () => {
    it('should update tournament and create next round matches when round 1 is complete', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
        tournamentId,
      };

      // Create first round matches (all completed)
      const match1 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player1,
        player2,
        2,
        0,
        MatchStatus.COMPLETED,
      );
      const match2 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player3,
        player4,
        2,
        1,
        MatchStatus.COMPLETED,
      );

      // Setup mock responses
      mockMatchRepository.findByFilter.mockResolvedValue([match1, match2]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);

      if (result.isSuccess()) {
        const output = result.getValue();
        expect(output.tournamentId).toBe(tournamentId);
        expect(output.updatedStatus).toBe(TournamentStatus.ACTIVE);
        expect(output.isComplete).toBe(false);

        // Should create 1 match for round 2
        expect(output.nextRoundMatches.length).toBe(1);
        expect(output.nextRoundMatches[0].round).toBe(2);
        expect(output.nextRoundMatches[0].homePlayerOneId).toBe(player1); // Winner of match1
        expect(output.nextRoundMatches[0].awayPlayerOneId).toBe(player3); // Winner of match2
        expect(output.nextRoundMatches[0].status).toBe(MatchStatus.SCHEDULED);

        // Verify repository was called correctly
        expect(mockMatchRepository.save).toHaveBeenCalledTimes(1);
      }
    });

    it('should handle odd number of winners with bye match', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
        tournamentId,
      };

      // Add a fifth player to create an odd number situation
      const player5 = '5a99fdd2-856f-42f2-a5c1-0ad5a1e1c73e';

      // Create first round matches (all completed) with 3 winners
      const match1 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player1,
        player2,
        2,
        0,
        MatchStatus.COMPLETED,
      );
      const match2 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player3,
        player4,
        2,
        1,
        MatchStatus.COMPLETED,
      );
      const match3 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player5,
        '',
        2,
        0,
        MatchStatus.COMPLETED,
      ); // Bye match

      // Setup mock responses
      mockMatchRepository.findByFilter.mockResolvedValue([match1, match2, match3]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);

      if (result.isSuccess()) {
        const output = result.getValue();

        // Should create 2 matches for round 2 (including 1 bye)
        expect(output.nextRoundMatches.length).toBe(2);

        // Check that we have one regular match and one bye match
        const regularMatches = output.nextRoundMatches.filter(m => m.awayPlayerOneId !== '');
        const byeMatches = output.nextRoundMatches.filter(m => m.awayPlayerOneId === '');

        expect(regularMatches.length).toBe(1);
        expect(byeMatches.length).toBe(1);

        // Verify the repository was called for both matches
        expect(mockMatchRepository.save).toHaveBeenCalledTimes(2);
      }
    });

    it('should complete the tournament when the final match is done', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
        tournamentId,
      };

      // Create a semifinal round (round 2) that has been completed
      const finalMatch = createMatch(
        uuidv4(),
        tournamentId,
        2,
        player1,
        player3,
        2,
        0,
        MatchStatus.COMPLETED,
      );

      // Also include previous round matches
      const match1 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player1,
        player2,
        2,
        0,
        MatchStatus.COMPLETED,
      );
      const match2 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player3,
        player4,
        2,
        1,
        MatchStatus.COMPLETED,
      );

      // Setup mock responses
      mockMatchRepository.findByFilter.mockResolvedValue([match1, match2, finalMatch]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);

      if (result.isSuccess()) {
        const output = result.getValue();
        expect(output.isComplete).toBe(true);
        expect(output.updatedStatus).toBe(TournamentStatus.COMPLETED);
        expect(output.winnerId).toBe(player1);
        expect(output.nextRoundMatches.length).toBe(0);

        // Verify tournament status was updated
        expect(mockTournamentRepository.update).toHaveBeenCalledTimes(1);
        const updatedTournament = mockTournamentRepository.update.mock.calls[0][0];
        expect(updatedTournament.status).toBe(TournamentStatus.COMPLETED);
      }
    });
  });

  describe('Failure cases', () => {
    it('should fail if tournament does not exist', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
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

    it('should fail if tournament is not in ACTIVE state', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
        tournamentId,
      };

      // Create tournament in DRAFT state
      const tournament = createActiveTournament();
      tournament.status = TournamentStatus.DRAFT;
      mockTournamentRepository.findById.mockResolvedValue(tournament);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('not in ACTIVE state');
    });

    it('should fail if no matches are found for the tournament', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
        tournamentId,
      };

      mockMatchRepository.findByFilter.mockResolvedValue([]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('No matches found');
    });

    it('should fail if not all matches in current round are completed', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
        tournamentId,
      };

      // Create first round with one completed match and one pending match
      const match1 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player1,
        player2,
        2,
        0,
        MatchStatus.COMPLETED,
      );
      const match2 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player3,
        player4,
        null,
        null,
        MatchStatus.PENDING,
      );

      mockMatchRepository.findByFilter.mockResolvedValue([match1, match2]);

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Not all matches in round');
      expect(result.getError().message).toContain('are completed yet');
    });

    it('should fail if input validation fails', async () => {
      // Arrange
      const input = {
        tournamentId: 'invalid-uuid',
      } as UpdateTournamentMatchesAndStandingsInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Invalid input');
    });

    it('should fail if an error occurs during match creation', async () => {
      // Arrange
      const input: UpdateTournamentMatchesAndStandingsInput = {
        tournamentId,
      };

      // Create first round matches (all completed)
      const match1 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player1,
        player2,
        2,
        0,
        MatchStatus.COMPLETED,
      );
      const match2 = createMatch(
        uuidv4(),
        tournamentId,
        1,
        player3,
        player4,
        2,
        1,
        MatchStatus.COMPLETED,
      );

      mockMatchRepository.findByFilter.mockResolvedValue([match1, match2]);
      mockMatchRepository.save.mockRejectedValue(new Error('Database error during match save'));

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Database error during match save');
    });
  });
});
