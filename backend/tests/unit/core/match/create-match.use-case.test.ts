import { CreateMatchUseCase } from '../../../../src/core/application/use-cases/match/create-match.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { TournamentStatus } from '../../../../src/core/domain/tournament/tournament.entity';

describe('CreateMatchUseCase', () => {
  let createMatchUseCase: CreateMatchUseCase;
  let mockMatchRepository: jest.Mocked<IMatchRepository>;
  let mockTournamentRepository: jest.Mocked<ITournamentRepository>;

  beforeEach(() => {
    mockMatchRepository = {
      findById: jest.fn(),
      findByFilter: jest.fn(),
      findByTournamentAndRound: jest.fn(),
      findByPlayerId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockTournamentRepository = {
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

    createMatchUseCase = new CreateMatchUseCase(mockMatchRepository, mockTournamentRepository);
  });

  const validInput = {
    tournamentId: '123e4567-e89b-12d3-a456-426614174000',
    homePlayerOneId: '123e4567-e89b-12d3-a456-426614174001',
    homePlayerTwoId: '123e4567-e89b-12d3-a456-426614174002',
    awayPlayerOneId: '123e4567-e89b-12d3-a456-426614174003',
    awayPlayerTwoId: '123e4567-e89b-12d3-a456-426614174004',
    round: 1,
    date: '2023-07-10T10:00:00Z',
    location: 'Court 1',
    status: MatchStatus.PENDING,
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
    mockTournamentRepository.findById.mockResolvedValue(mockActiveTournament as any);
    mockMatchRepository.save.mockImplementation(async (match: Match) => {
      // Simulate ID generation
      Object.defineProperty(match, 'id', {
        value: '123e4567-e89b-12d3-a456-426614174099',
      });
    });

    // Act
    const result = await createMatchUseCase.execute(validInput);

    // Assert
    expect(result.isSuccess).toBe(true);
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
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Tournament not found');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when tournament is not in ACTIVE or OPEN state', async () => {
    // Arrange
    const draftTournament = { ...mockActiveTournament, status: TournamentStatus.DRAFT };
    mockTournamentRepository.findById.mockResolvedValue(draftTournament as any);

    // Act
    const result = await createMatchUseCase.execute(validInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Cannot create matches for tournaments');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });

  test('should fail when duplicate players are provided', async () => {
    // Arrange
    mockTournamentRepository.findById.mockResolvedValue(mockActiveTournament as any);
    const inputWithDuplicatePlayers = {
      ...validInput,
      // Make homePlayerTwoId the same as homePlayerOneId
      homePlayerTwoId: validInput.homePlayerOneId,
    };

    // Act
    const result = await createMatchUseCase.execute(inputWithDuplicatePlayers);

    // Assert
    expect(result.isFailure).toBe(true);
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
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Round must be a positive integer');
    expect(mockMatchRepository.save).not.toHaveBeenCalled();
  });
});
