import {
  ListTournamentMatchesUseCase,
  ListTournamentMatchesInput,
} from '../../../../src/core/application/use-cases/match/list-tournament-matches.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { ITournamentRepository } from '../../../../src/core/application/interfaces/repositories/tournament.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import {
  Tournament,
  TournamentStatus,
  PlayerLevel,
  TournamentFormat,
} from '../../../../src/core/domain/tournament/tournament.entity';

describe('ListTournamentMatchesUseCase', () => {
  let listTournamentMatchesUseCase: ListTournamentMatchesUseCase;
  let mockMatchRepository: jest.Mocked<IMatchRepository>;
  let mockTournamentRepository: jest.Mocked<ITournamentRepository>;

  const tournamentId = '123e4567-e89b-12d3-a456-426614174000';

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

    listTournamentMatchesUseCase = new ListTournamentMatchesUseCase(
      mockMatchRepository,
      mockTournamentRepository,
    );
  });

  // Create a mock tournament
  const createMockTournament = () => {
    return new Tournament(
      tournamentId,
      'Test Tournament',
      'Description',
      new Date('2023-10-01'),
      new Date('2023-10-15'),
      TournamentFormat.SINGLE_ELIMINATION,
      TournamentStatus.ACTIVE,
      'Test Location',
      16, // maxParticipants
      new Date('2023-09-30'), // registrationDeadline
      PlayerLevel.P3, // category
      '123e4567-e89b-12d3-a456-426614174001', // createdById
      new Date('2023-08-01'), // createdAt
      new Date('2023-08-01'), // updatedAt
    );
  };

  // Create mock matches for a tournament
  const createMockMatches = (count: number, status?: MatchStatus, round?: number) => {
    const matches: Match[] = [];

    for (let i = 0; i < count; i++) {
      matches.push(
        new Match(
          `match-${i}`,
          tournamentId,
          `player-${i}-1`,
          `player-${i}-2`,
          `player-${i}-3`,
          `player-${i}-4`,
          round || Math.floor(i / 4) + 1, // Group matches into rounds
          new Date(`2023-10-0${(i % 9) + 1}`), // Different days
          `Court ${(i % 5) + 1}`,
          status ||
            (i % 5 === 0
              ? MatchStatus.PENDING
              : i % 5 === 1
                ? MatchStatus.SCHEDULED
                : i % 5 === 2
                  ? MatchStatus.IN_PROGRESS
                  : i % 5 === 3
                    ? MatchStatus.COMPLETED
                    : MatchStatus.CANCELED),
          i % 5 === 3 ? 3 : null, // Only completed matches have scores
          i % 5 === 3 ? 1 : null,
          new Date('2023-09-01'),
          new Date('2023-09-01'),
        ),
      );
    }

    return matches;
  };

  test('should return paginated matches with default pagination', async () => {
    // Arrange
    const mockTournament = createMockTournament();
    const mockMatches = createMockMatches(25); // Create 25 matches
    const defaultPageSize = 10;

    mockTournamentRepository.findById.mockResolvedValue(mockTournament);
    mockMatchRepository.findByFilter.mockImplementation(filter => {
      if (filter.limit && filter.offset !== undefined) {
        // Return paginated results
        return Promise.resolve(mockMatches.slice(filter.offset, filter.offset + filter.limit));
      } else {
        // Return all for count
        return Promise.resolve(mockMatches);
      }
    });

    const input: ListTournamentMatchesInput = {
      tournamentId,
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      expect(output.matches).toHaveLength(defaultPageSize);
      expect(output.pagination.totalItems).toBe(25);
      expect(output.pagination.currentPage).toBe(1);
      expect(output.pagination.totalPages).toBe(3);
      expect(output.pagination.hasNextPage).toBe(true);
      expect(output.pagination.hasPreviousPage).toBe(false);
    }
    expect(mockTournamentRepository.findById).toHaveBeenCalledWith(tournamentId);
    expect(mockMatchRepository.findByFilter).toHaveBeenCalledTimes(2);
  });

  test('should return paginated matches with custom pagination', async () => {
    // Arrange
    const mockTournament = createMockTournament();
    const mockMatches = createMockMatches(25); // Create 25 matches
    const pageSize = 5;
    const page = 3;

    mockTournamentRepository.findById.mockResolvedValue(mockTournament);
    mockMatchRepository.findByFilter.mockImplementation(filter => {
      if (filter.limit && filter.offset !== undefined) {
        // Return paginated results
        return Promise.resolve(mockMatches.slice(filter.offset, filter.offset + filter.limit));
      } else {
        // Return all for count
        return Promise.resolve(mockMatches);
      }
    });

    const input: ListTournamentMatchesInput = {
      tournamentId,
      page,
      limit: pageSize,
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      expect(output.matches).toHaveLength(pageSize);
      expect(output.pagination.totalItems).toBe(25);
      expect(output.pagination.currentPage).toBe(page);
      expect(output.pagination.totalPages).toBe(5);
      expect(output.pagination.hasNextPage).toBe(true);
      expect(output.pagination.hasPreviousPage).toBe(true);
    }
  });

  test('should filter matches by status', async () => {
    // Arrange
    const mockTournament = createMockTournament();
    const allMockMatches = createMockMatches(25);
    const completedMatches = createMockMatches(5, MatchStatus.COMPLETED);

    mockTournamentRepository.findById.mockResolvedValue(mockTournament);
    mockMatchRepository.findByFilter.mockImplementation(filter => {
      if (filter.status === MatchStatus.COMPLETED) {
        if (filter.limit && filter.offset !== undefined) {
          return Promise.resolve(
            completedMatches.slice(filter.offset, filter.offset + filter.limit),
          );
        }
        return Promise.resolve(completedMatches);
      } else {
        if (filter.limit && filter.offset !== undefined) {
          return Promise.resolve(allMockMatches.slice(filter.offset, filter.offset + filter.limit));
        }
        return Promise.resolve(allMockMatches);
      }
    });

    const input: ListTournamentMatchesInput = {
      tournamentId,
      status: MatchStatus.COMPLETED,
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      expect(output.matches).toHaveLength(5);
      expect(output.pagination.totalItems).toBe(5);
      expect(mockMatchRepository.findByFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          tournamentId,
          status: MatchStatus.COMPLETED,
        }),
      );
    }
  });

  test('should filter matches by round', async () => {
    // Arrange
    const mockTournament = createMockTournament();
    const allMockMatches = createMockMatches(25);
    const round2Matches = createMockMatches(4, undefined, 2);

    mockTournamentRepository.findById.mockResolvedValue(mockTournament);
    mockMatchRepository.findByFilter.mockImplementation(filter => {
      if (filter.round === 2) {
        if (filter.limit && filter.offset !== undefined) {
          return Promise.resolve(round2Matches.slice(filter.offset, filter.offset + filter.limit));
        }
        return Promise.resolve(round2Matches);
      } else {
        if (filter.limit && filter.offset !== undefined) {
          return Promise.resolve(allMockMatches.slice(filter.offset, filter.offset + filter.limit));
        }
        return Promise.resolve(allMockMatches);
      }
    });

    const input: ListTournamentMatchesInput = {
      tournamentId,
      round: 2,
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      expect(output.matches).toHaveLength(4);
      expect(output.pagination.totalItems).toBe(4);
      expect(mockMatchRepository.findByFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          tournamentId,
          round: 2,
        }),
      );
    }
  });

  test('should combine filters for status and round', async () => {
    // Arrange
    const mockTournament = createMockTournament();
    const allMockMatches = createMockMatches(25);
    const filteredMatches = createMockMatches(2, MatchStatus.COMPLETED, 2);

    mockTournamentRepository.findById.mockResolvedValue(mockTournament);
    mockMatchRepository.findByFilter.mockImplementation(filter => {
      if (filter.status === MatchStatus.COMPLETED && filter.round === 2) {
        if (filter.limit && filter.offset !== undefined) {
          return Promise.resolve(
            filteredMatches.slice(filter.offset, filter.offset + filter.limit),
          );
        }
        return Promise.resolve(filteredMatches);
      } else {
        if (filter.limit && filter.offset !== undefined) {
          return Promise.resolve(allMockMatches.slice(filter.offset, filter.offset + filter.limit));
        }
        return Promise.resolve(allMockMatches);
      }
    });

    const input: ListTournamentMatchesInput = {
      tournamentId,
      status: MatchStatus.COMPLETED,
      round: 2,
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      expect(output.matches).toHaveLength(2);
      expect(output.pagination.totalItems).toBe(2);
      expect(mockMatchRepository.findByFilter).toHaveBeenCalledWith(
        expect.objectContaining({
          tournamentId,
          status: MatchStatus.COMPLETED,
          round: 2,
        }),
      );
    }
  });

  test('should return empty array when no matches are found', async () => {
    // Arrange
    const mockTournament = createMockTournament();

    mockTournamentRepository.findById.mockResolvedValue(mockTournament);
    mockMatchRepository.findByFilter.mockResolvedValue([]);

    const input: ListTournamentMatchesInput = {
      tournamentId,
      status: MatchStatus.CANCELED,
      round: 10, // Non-existent round
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      expect(output.matches).toHaveLength(0);
      expect(output.pagination.totalItems).toBe(0);
      expect(output.pagination.totalPages).toBe(0);
      expect(output.pagination.hasNextPage).toBe(false);
      expect(output.pagination.hasPreviousPage).toBe(false);
    }
  });

  test('should fail when tournament is not found', async () => {
    // Arrange
    mockTournamentRepository.findById.mockResolvedValue(null);

    const input: ListTournamentMatchesInput = {
      tournamentId,
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Tournament not found');
    expect(mockMatchRepository.findByFilter).not.toHaveBeenCalled();
  });

  test('should fail with invalid tournament ID format', async () => {
    // Arrange
    const invalidInput = {
      tournamentId: 'invalid-uuid',
    } as ListTournamentMatchesInput;

    // Act
    const result = await listTournamentMatchesUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid tournament ID format');
    expect(mockTournamentRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.findByFilter).not.toHaveBeenCalled();
  });

  test('should fail with invalid pagination parameters', async () => {
    // Arrange
    const invalidInput = {
      tournamentId,
      page: -1, // Invalid page number
      limit: 200, // Exceeds maximum limit
    } as ListTournamentMatchesInput;

    // Act
    const result = await listTournamentMatchesUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
    expect(mockTournamentRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.findByFilter).not.toHaveBeenCalled();
  });

  test('should handle repository errors', async () => {
    // Arrange
    const errorMessage = 'Database error';
    mockTournamentRepository.findById.mockRejectedValue(new Error(errorMessage));

    const input: ListTournamentMatchesInput = {
      tournamentId,
    };

    // Act
    const result = await listTournamentMatchesUseCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain(errorMessage);
    expect(mockMatchRepository.findByFilter).not.toHaveBeenCalled();
  });
});
