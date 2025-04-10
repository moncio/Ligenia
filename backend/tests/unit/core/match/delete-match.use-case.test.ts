import {
  DeleteMatchUseCase,
  DeleteMatchInput,
} from '../../../../src/core/application/use-cases/match/delete-match.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import {
  Tournament,
  TournamentStatus,
  TournamentFormat,
  PlayerLevel,
} from '../../../../src/core/domain/tournament/tournament.entity';
import { Result } from '../../../../src/shared/result';

// Mock repositories
jest.mock('../../../../src/core/application/interfaces/repositories/match.repository');
jest.mock('../../../../src/core/application/interfaces/repositories/tournament.repository');

describe('DeleteMatchUseCase', () => {
  let matchRepository: jest.Mocked<IMatchRepository>;
  let tournamentRepository: jest.Mocked<ITournamentRepository>;
  let deleteMatchUseCase: DeleteMatchUseCase;

  // Test constants
  const matchId = '123e4567-e89b-12d3-a456-426614174000';
  const tournamentId = '123e4567-e89b-12d3-a456-426614174001';
  const userId = '123e4567-e89b-12d3-a456-426614174002';
  const otherUserId = '123e4567-e89b-12d3-a456-426614174003';

  beforeEach(() => {
    // Initialize mock repositories
    matchRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByFilter: jest.fn(),
      count: jest.fn(),
    } as any;

    tournamentRepository = {
      findById: jest.fn(),
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
    } as any;

    // Initialize use case
    deleteMatchUseCase = new DeleteMatchUseCase(matchRepository, tournamentRepository);
  });

  // Helper function to create a mock match
  const createMockMatch = (status: MatchStatus): Match => {
    return new Match(
      matchId,
      tournamentId,
      'player1',
      'player2',
      'player3',
      'player4',
      1,
      new Date(),
      'Test Court',
      status,
      null,
      null,
      new Date(),
      new Date(),
    );
  };

  // Helper function to create a mock tournament
  const createMockTournament = (creatorId: string, status: TournamentStatus): Tournament => {
    return {
      id: tournamentId,
      name: 'Test Tournament',
      description: 'Tournament for testing',
      startDate: new Date(),
      endDate: new Date(),
      format: TournamentFormat.SINGLE_ELIMINATION,
      status: status,
      location: 'Test Location',
      maxParticipants: 16,
      registrationDeadline: new Date(),
      category: PlayerLevel.P3,
      createdById: creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Tournament;
  };

  // Test successful deletion when user is the tournament creator
  it('should successfully delete a match when the user is the tournament creator and the match is pending', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);
    matchRepository.delete.mockResolvedValue(true);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(matchRepository.findById).toHaveBeenCalledWith(matchId);
    expect(tournamentRepository.findById).toHaveBeenCalledWith(tournamentId);
    expect(matchRepository.delete).toHaveBeenCalledWith(matchId);
  });

  it('should successfully delete a match when the user is the tournament creator and the match is scheduled', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.SCHEDULED);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);
    matchRepository.delete.mockResolvedValue(true);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(matchRepository.findById).toHaveBeenCalledWith(matchId);
    expect(tournamentRepository.findById).toHaveBeenCalledWith(tournamentId);
    expect(matchRepository.delete).toHaveBeenCalledWith(matchId);
  });

  it('should successfully delete a match when the tournament is in OPEN status', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);
    matchRepository.delete.mockResolvedValue(true);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isSuccess()).toBe(true);
    expect(matchRepository.findById).toHaveBeenCalledWith(matchId);
    expect(tournamentRepository.findById).toHaveBeenCalledWith(tournamentId);
    expect(matchRepository.delete).toHaveBeenCalledWith(matchId);
  });

  // Test failure scenarios

  it('should fail when the match does not exist', async () => {
    // Arrange
    matchRepository.findById.mockResolvedValue(null);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Match not found');
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the tournament does not exist', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(null);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Tournament not found');
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the user is not the tournament creator', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(otherUserId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Permission denied: only tournament creator can delete matches',
    );
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the match is in COMPLETED status', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.COMPLETED);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Cannot delete match in COMPLETED status. Only PENDING or SCHEDULED matches can be deleted',
    );
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the match is in IN_PROGRESS status', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.IN_PROGRESS);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Cannot delete match in IN_PROGRESS status. Only PENDING or SCHEDULED matches can be deleted',
    );
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the match is in CANCELED status', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.CANCELED);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Cannot delete match in CANCELED status. Only PENDING or SCHEDULED matches can be deleted',
    );
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the tournament is in ACTIVE status', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(userId, TournamentStatus.ACTIVE);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Cannot delete match in tournament with ACTIVE status. Tournament must be in DRAFT status'
    );
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the tournament is in COMPLETED status', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(userId, TournamentStatus.COMPLETED);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Cannot delete match in tournament with COMPLETED status. Tournament must be in DRAFT status'
    );
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the tournament is in CANCELLED status', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(userId, TournamentStatus.CANCELLED);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe(
      'Cannot delete match in tournament with CANCELLED status. Tournament must be in DRAFT status'
    );
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  // Validation tests

  it('should fail when the match ID is not a valid UUID', async () => {
    // Act
    const result = await deleteMatchUseCase.execute({
      matchId: 'invalid-uuid',
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Invalid input: Invalid match ID format');
    expect(matchRepository.findById).not.toHaveBeenCalled();
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when the user ID is not a valid UUID', async () => {
    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId: 'invalid-uuid',
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Invalid input: Invalid user ID format');
    expect(matchRepository.findById).not.toHaveBeenCalled();
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  // Repository error tests

  it('should fail when there is an error looking up the match', async () => {
    // Arrange
    matchRepository.findById.mockRejectedValue(new Error('Database error'));

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Database error');
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when there is an error looking up the tournament', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockRejectedValue(new Error('Database error'));

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Database error');
    expect(matchRepository.delete).not.toHaveBeenCalled();
  });

  it('should fail when there is an error deleting the match', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);
    matchRepository.delete.mockRejectedValue(new Error('Database error'));

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Database error');
  });

  it('should fail when the match repository returns false on delete', async () => {
    // Arrange
    const mockMatch = createMockMatch(MatchStatus.PENDING);
    const mockTournament = createMockTournament(userId, TournamentStatus.DRAFT);

    matchRepository.findById.mockResolvedValue(mockMatch);
    tournamentRepository.findById.mockResolvedValue(mockTournament);
    matchRepository.delete.mockResolvedValue(false);

    // Act
    const result = await deleteMatchUseCase.execute({
      matchId,
      userId,
    });

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Failed to delete the match');
  });
});
