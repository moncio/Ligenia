import { GetMatchByIdUseCase } from '../../../../src/core/application/use-cases/match/get-match-by-id.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';

describe('GetMatchByIdUseCase', () => {
  let getMatchByIdUseCase: GetMatchByIdUseCase;
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

    getMatchByIdUseCase = new GetMatchByIdUseCase(mockMatchRepository);
  });

  const mockMatchId = '123e4567-e89b-12d3-a456-426614174000';

  // Mock match data
  const mockMatch: Match = new Match(
    mockMatchId,
    '123e4567-e89b-12d3-a456-426614174001', // tournamentId
    '123e4567-e89b-12d3-a456-426614174002', // homePlayerOneId
    '123e4567-e89b-12d3-a456-426614174003', // homePlayerTwoId
    '123e4567-e89b-12d3-a456-426614174004', // awayPlayerOneId
    '123e4567-e89b-12d3-a456-426614174005', // awayPlayerTwoId
    1, // round
    new Date('2023-07-10T10:00:00Z'), // date
    'Court 1', // location
    MatchStatus.SCHEDULED, // status
    null, // homeScore
    null, // awayScore
    new Date('2023-07-01T10:00:00Z'), // createdAt
    new Date('2023-07-01T10:00:00Z'), // updatedAt
  );

  test('should get a match successfully when ID exists', async () => {
    // Arrange
    mockMatchRepository.findById.mockResolvedValue(mockMatch);

    // Act
    const result = await getMatchByIdUseCase.execute({ id: mockMatchId });

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeInstanceOf(Match);
    expect(result.getValue().id).toBe(mockMatchId);
    expect(mockMatchRepository.findById).toHaveBeenCalledWith(mockMatchId);
  });

  test('should fail when match ID does not exist', async () => {
    // Arrange
    mockMatchRepository.findById.mockResolvedValue(null);

    // Act
    const result = await getMatchByIdUseCase.execute({ id: mockMatchId });

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Match not found');
    expect(mockMatchRepository.findById).toHaveBeenCalledWith(mockMatchId);
  });

  test('should fail when input validation fails (invalid ID format)', async () => {
    // Arrange
    const invalidId = 'invalid-uuid-format';

    // Act
    const result = await getMatchByIdUseCase.execute({ id: invalidId });

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid match ID format');
    expect(mockMatchRepository.findById).not.toHaveBeenCalled();
  });

  test('should handle repository errors', async () => {
    // Arrange
    const errorMessage = 'Database error';
    mockMatchRepository.findById.mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await getMatchByIdUseCase.execute({ id: mockMatchId });

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain(errorMessage);
    expect(mockMatchRepository.findById).toHaveBeenCalledWith(mockMatchId);
  });
});
