import { CreateMatchUseCase } from '../../../../src/core/application/use-cases/match/create-match.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { Tournament, TournamentStatus, TournamentFormat, PlayerLevel } from '../../../../src/core/domain/tournament/tournament.entity';
import { Result } from '../../../../src/shared/result';

describe('CreateMatchUseCase', () => {
  let createMatchUseCase: CreateMatchUseCase;
  let mockMatchRepository: jest.Mocked<IMatchRepository>;
  let mockTournamentRepository: jest.Mocked<ITournamentRepository>;

  beforeEach(() => {
    mockMatchRepository = {
      save: jest.fn().mockImplementation((match) => {
        return Promise.resolve();
      }),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      findByTournamentAndRound: jest.fn(),
      findByPlayerId: jest.fn(),
      count: jest.fn(),
      tournamentHasMatches: jest.fn().mockResolvedValue(false),
    } as jest.Mocked<IMatchRepository>;

    mockTournamentRepository = {
      findById: jest.fn().mockResolvedValue(
        new Tournament(
          '123e4567-e89b-12d3-a456-426614174000',
          'Test Tournament',
          'Test Tournament Description',
          new Date(),
          new Date(),
          TournamentFormat.SINGLE_ELIMINATION,
          TournamentStatus.DRAFT,
          'Test Location',
          16,
          new Date(),
          PlayerLevel.P1,
          '123e4567-e89b-12d3-a456-426614174005',
          new Date(),
          new Date()
        )
      ),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countParticipants: jest.fn(),
      registerParticipant: jest.fn(),
      unregisterParticipant: jest.fn(),
      isParticipantRegistered: jest.fn(),
      getParticipants: jest.fn(),
      countParticipantsByTournamentId: jest.fn(),
      count: jest.fn(),
    } as jest.Mocked<ITournamentRepository>;

    createMatchUseCase = new CreateMatchUseCase(mockMatchRepository, mockTournamentRepository);
  });

  const validInput = {
    tournamentId: '123e4567-e89b-12d3-a456-426614174000',
    homePlayerOneId: '123e4567-e89b-12d3-a456-426614174001',
    homePlayerTwoId: '123e4567-e89b-12d3-a456-426614174002',
    awayPlayerOneId: '123e4567-e89b-12d3-a456-426614174003',
    awayPlayerTwoId: '123e4567-e89b-12d3-a456-426614174004',
    round: 1,
    date: new Date().toISOString(),
    location: 'Court 1',
  };

  // Mock active tournament
  const mockActiveTournament = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: TournamentStatus.ACTIVE,
    name: 'Test Tournament',
    startDate: new Date(),
    // Other required properties
  };

  test('should create a match successfully when all inputs are valid', async () => {
    // Arrange
    const now = new Date();
    mockTournamentRepository.findById.mockResolvedValue(
      new Tournament(
        validInput.tournamentId,
        'Test Tournament',
        'Test Tournament Description',
        now,
        now,
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.DRAFT,
        'Test Location',
        16,
        now,
        PlayerLevel.P1,
        '123e4567-e89b-12d3-a456-426614174005',
        now,
        now
      )
    );

    mockMatchRepository.save.mockImplementation(async (match: Match) => {
      return Promise.resolve();
    });

    // Act
    const result = await createMatchUseCase.execute(validInput);

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(mockMatchRepository.save).toHaveBeenCalled();
    const savedMatch = mockMatchRepository.save.mock.calls[0][0];
    expect(savedMatch.tournamentId).toBe(validInput.tournamentId);
    expect(savedMatch.homePlayerOneId).toBe(validInput.homePlayerOneId);
    expect(savedMatch.round).toBe(validInput.round);
    expect(savedMatch.homeScore).toBeNull();
    expect(result.getValue()).toBeInstanceOf(Match);
    expect(result.getValue().tournamentId).toBe(validInput.tournamentId);
    expect(result.getValue().homePlayerOneId).toBe(validInput.homePlayerOneId);
    expect(result.getValue().round).toBe(validInput.round);
    expect(result.getValue().homeScore).toBeNull();
    expect(result.getValue().awayScore).toBeNull();
    expect(mockMatchRepository.save).toHaveBeenCalled();
  });

  test('should fail when tournament does not exist', async () => {
    // Arrange
    mockTournamentRepository.findById.mockResolvedValue(null);

    // Act
    const result = await createMatchUseCase.execute(validInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Tournament not found');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when tournament is not in DRAFT state', async () => {
    // Arrange
    const now = new Date();
    mockTournamentRepository.findById.mockResolvedValueOnce(
      new Tournament(
        validInput.tournamentId,
        'Test Tournament',
        'Test Tournament Description',
        now,
        now,
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.ACTIVE,
        'Test Location',
        16,
        now,
        PlayerLevel.P1,
        '123e4567-e89b-12d3-a456-426614174005',
        now,
        now
      )
    );

    // Act
    const result = await createMatchUseCase.execute(validInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Cannot create matches for tournaments that are not in DRAFT status');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when duplicate players are provided', async () => {
    // Arrange
    const now = new Date();
    mockTournamentRepository.findById.mockResolvedValue(
      new Tournament(
        validInput.tournamentId,
        'Test Tournament',
        'Test Tournament Description',
        now,
        now,
        TournamentFormat.SINGLE_ELIMINATION,
        TournamentStatus.DRAFT,
        'Test Location',
        16,
        now,
        PlayerLevel.P1,
        '123e4567-e89b-12d3-a456-426614174005',
        now,
        now
      )
    );

    const inputWithDuplicatePlayers = {
      ...validInput,
      // Make homePlayerTwoId the same as homePlayerOneId
      homePlayerTwoId: validInput.homePlayerOneId,
    };

    // Act
    const result = await createMatchUseCase.execute(inputWithDuplicatePlayers);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Duplicate players are not allowed');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail with invalid input data', async () => {
    // Arrange
    const invalidInput = {
      ...validInput,
      round: -1, // Invalid round number
    };

    // Act
    const result = await createMatchUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Round must be a positive integer');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });
});
