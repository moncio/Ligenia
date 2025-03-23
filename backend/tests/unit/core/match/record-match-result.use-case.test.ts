import { RecordMatchResultUseCase } from '../../../../src/core/application/use-cases/match/record-match-result.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';

describe('RecordMatchResultUseCase', () => {
  let recordMatchResultUseCase: RecordMatchResultUseCase;
  let mockMatchRepository: jest.Mocked<IMatchRepository>;

  beforeEach(() => {
    mockMatchRepository = {
      findById: jest.fn(),
      findByFilter: jest.fn(),
      findByTournamentAndRound: jest.fn(),
      findByPlayerId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    recordMatchResultUseCase = new RecordMatchResultUseCase(mockMatchRepository);
  });

  const mockMatchId = '123e4567-e89b-12d3-a456-426614174000';

  // Mock match data
  const createMockMatch = (status: MatchStatus = MatchStatus.IN_PROGRESS): Match => {
    return new Match(
      mockMatchId,
      '123e4567-e89b-12d3-a456-426614174001', // tournamentId
      '123e4567-e89b-12d3-a456-426614174002', // homePlayerOneId
      '123e4567-e89b-12d3-a456-426614174003', // homePlayerTwoId
      '123e4567-e89b-12d3-a456-426614174004', // awayPlayerOneId
      '123e4567-e89b-12d3-a456-426614174005', // awayPlayerTwoId
      1, // round
      new Date('2023-07-10T10:00:00Z'), // date
      'Court 1', // location
      status, // status
      null, // homeScore
      null, // awayScore
      new Date('2023-07-01T10:00:00Z'), // createdAt
      new Date('2023-07-01T10:00:00Z')  // updatedAt
    );
  };

  test('should record match result successfully', async () => {
    // Arrange
    const mockMatch = createMockMatch();
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeInstanceOf(Match);
    expect(result.getValue().id).toBe(mockMatchId);
    expect(result.getValue().homeScore).toBe(validInput.homeScore);
    expect(result.getValue().awayScore).toBe(validInput.awayScore);
    expect(result.getValue().status).toBe(MatchStatus.COMPLETED);
    expect(mockMatchRepository.save).toHaveBeenCalledWith(mockMatch);
  });

  test('should fail when match does not exist', async () => {
    // Arrange
    mockMatchRepository.findById.mockResolvedValue(null);
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Match not found');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when match is not in IN_PROGRESS state (PENDING)', async () => {
    // Arrange
    const pendingMatch = createMockMatch(MatchStatus.PENDING);
    mockMatchRepository.findById.mockResolvedValue(pendingMatch);
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Only matches in IN_PROGRESS state can have results recorded');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when match is not in IN_PROGRESS state (SCHEDULED)', async () => {
    // Arrange
    const scheduledMatch = createMockMatch(MatchStatus.SCHEDULED);
    mockMatchRepository.findById.mockResolvedValue(scheduledMatch);
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Only matches in IN_PROGRESS state can have results recorded');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when match is not in IN_PROGRESS state (COMPLETED)', async () => {
    // Arrange
    const completedMatch = createMockMatch(MatchStatus.COMPLETED);
    mockMatchRepository.findById.mockResolvedValue(completedMatch);
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Only matches in IN_PROGRESS state can have results recorded');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when match is not in IN_PROGRESS state (CANCELED)', async () => {
    // Arrange
    const canceledMatch = createMockMatch(MatchStatus.CANCELED);
    mockMatchRepository.findById.mockResolvedValue(canceledMatch);
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Only matches in IN_PROGRESS state can have results recorded');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail with invalid input data (invalid match ID)', async () => {
    // Arrange
    const invalidInput = {
      id: 'invalid-uuid',
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(invalidInput as any);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid match ID format');
    expect(mockMatchRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail with invalid input data (negative home score)', async () => {
    // Arrange
    const invalidInput = {
      id: mockMatchId,
      homeScore: -1,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Home score must be a non-negative integer');
    expect(mockMatchRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail with invalid input data (negative away score)', async () => {
    // Arrange
    const invalidInput = {
      id: mockMatchId,
      homeScore: 1,
      awayScore: -1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Away score must be a non-negative integer');
    expect(mockMatchRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail with invalid input data (equal scores)', async () => {
    // Arrange
    const invalidInput = {
      id: mockMatchId,
      homeScore: 2,
      awayScore: 2
    };

    // Act
    const result = await recordMatchResultUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Scores cannot be equal, a winner must be determined');
    expect(mockMatchRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should handle repository errors during findById', async () => {
    // Arrange
    const errorMessage = 'Database error during find';
    mockMatchRepository.findById.mockRejectedValue(new Error(errorMessage));
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain(errorMessage);
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should handle repository errors during save', async () => {
    // Arrange
    const mockMatch = createMockMatch();
    const errorMessage = 'Database error during save';
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockMatchRepository.save.mockRejectedValue(new Error(errorMessage));
    
    const validInput = {
      id: mockMatchId,
      homeScore: 3,
      awayScore: 1
    };

    // Act
    const result = await recordMatchResultUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain(errorMessage);
    expect(mockMatchRepository.findById).toHaveBeenCalledWith(mockMatchId);
    expect(mockMatchRepository.save).toHaveBeenCalledWith(mockMatch);
  });
}); 