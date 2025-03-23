import { UpdateMatchDetailsUseCase } from '../../../../src/core/application/use-cases/match/update-match-details.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { z } from 'zod';

// Define the input type to match the use case's type
type UpdateMatchDetailsInput = {
  id: string;
  homePlayerOneId?: string;
  homePlayerTwoId?: string;
  awayPlayerOneId?: string;
  awayPlayerTwoId?: string;
  round?: number;
  date?: string | null;
  location?: string | null;
  status?: MatchStatus;
};

describe('UpdateMatchDetailsUseCase', () => {
  let updateMatchDetailsUseCase: UpdateMatchDetailsUseCase;
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

    updateMatchDetailsUseCase = new UpdateMatchDetailsUseCase(mockMatchRepository);
  });

  const mockMatchId = '123e4567-e89b-12d3-a456-426614174000';

  // Mock match data
  const createMockMatch = (status: MatchStatus = MatchStatus.PENDING): Match => {
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

  const validUpdateInput = {
    id: mockMatchId,
    round: 2,
    location: 'Court 2',
    date: '2023-07-15T10:00:00Z'
  };

  test('should update match details successfully when all inputs are valid', async () => {
    // Arrange
    const mockMatch = createMockMatch();
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    
    // Act
    const result = await updateMatchDetailsUseCase.execute(validUpdateInput);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBeInstanceOf(Match);
    expect(result.getValue().id).toBe(mockMatchId);
    expect(result.getValue().round).toBe(validUpdateInput.round);
    expect(result.getValue().location).toBe(validUpdateInput.location);
    expect(result.getValue().date).toEqual(new Date(validUpdateInput.date));
    expect(mockMatchRepository.save).toHaveBeenCalledWith(mockMatch);
  });

  test('should fail when match does not exist', async () => {
    // Arrange
    mockMatchRepository.findById.mockResolvedValue(null);

    // Act
    const result = await updateMatchDetailsUseCase.execute(validUpdateInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Match not found');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when match cannot be modified (completed status)', async () => {
    // Arrange
    const completedMatch = createMockMatch(MatchStatus.COMPLETED);
    mockMatchRepository.findById.mockResolvedValue(completedMatch);

    // Act
    const result = await updateMatchDetailsUseCase.execute(validUpdateInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Match cannot be modified');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when match cannot be modified (canceled status)', async () => {
    // Arrange
    const canceledMatch = createMockMatch(MatchStatus.CANCELED);
    mockMatchRepository.findById.mockResolvedValue(canceledMatch);

    // Act
    const result = await updateMatchDetailsUseCase.execute(validUpdateInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Match cannot be modified');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when trying to assign duplicate players', async () => {
    // Arrange
    const mockMatch = createMockMatch();
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    
    const inputWithDuplicatePlayers = {
      id: mockMatchId,
      homePlayerOneId: mockMatch.homePlayerTwoId, // Duplicate player ID
    };

    // Act
    const result = await updateMatchDetailsUseCase.execute(inputWithDuplicatePlayers);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Duplicate players are not allowed');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail with invalid input data (invalid match ID)', async () => {
    // Arrange
    const invalidInput = {
      id: 'invalid-uuid',
      round: 2
    };

    // Act
    const result = await updateMatchDetailsUseCase.execute(invalidInput as any);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid match ID format');
    expect(mockMatchRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail with invalid input data (invalid round)', async () => {
    // Arrange
    const invalidInput = {
      id: mockMatchId,
      round: -1
    };

    // Act
    const result = await updateMatchDetailsUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Round must be a positive integer');
    expect(mockMatchRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should update match status successfully', async () => {
    // Arrange
    const mockMatch = createMockMatch();
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    
    const updateStatusInput = {
      id: mockMatchId,
      status: MatchStatus.SCHEDULED
    };

    // Act
    const result = await updateMatchDetailsUseCase.execute(updateStatusInput);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe(MatchStatus.SCHEDULED);
    expect(mockMatchRepository.save).toHaveBeenCalledWith(mockMatch);
  });

  test('should update match date to null successfully', async () => {
    // Arrange
    const mockMatch = createMockMatch();
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    
    const updateDateInput: UpdateMatchDetailsInput = {
      id: mockMatchId,
      date: null
    };

    // Act
    const result = await updateMatchDetailsUseCase.execute(updateDateInput);

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().date).toBeNull();
    expect(mockMatchRepository.save).toHaveBeenCalledWith(mockMatch);
  });

  test('should handle repository errors', async () => {
    // Arrange
    const mockMatch = createMockMatch();
    const errorMessage = 'Database error';
    mockMatchRepository.findById.mockResolvedValue(mockMatch);
    mockMatchRepository.save.mockRejectedValue(new Error(errorMessage));

    // Act
    const result = await updateMatchDetailsUseCase.execute(validUpdateInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain(errorMessage);
    expect(mockMatchRepository.findById).toHaveBeenCalledWith(mockMatchId);
    expect(mockMatchRepository.save).toHaveBeenCalledWith(mockMatch);
  });
}); 