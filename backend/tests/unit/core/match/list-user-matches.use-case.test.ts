import {
  ListUserMatchesUseCase,
  ListUserMatchesInput,
  MatchResult,
} from '../../../../src/core/application/use-cases/match/list-user-matches.use-case';
import { IMatchRepository } from '../../../../src/core/application/interfaces/repositories/match.repository';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { Match, MatchStatus } from '../../../../src/core/domain/match/match.entity';
import { User } from '../../../../src/core/domain/user/user.entity';

describe('ListUserMatchesUseCase', () => {
  let listUserMatchesUseCase: ListUserMatchesUseCase;
  let mockMatchRepository: jest.Mocked<IMatchRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const tournamentId = '123e4567-e89b-12d3-a456-426614174111';

  beforeEach(() => {
    mockMatchRepository = {
      findById: jest.fn(),
      findByFilter: jest.fn(),
      findByTournamentAndRound: jest.fn(),
      findByPlayerId: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    listUserMatchesUseCase = new ListUserMatchesUseCase(mockMatchRepository, mockUserRepository);
  });

  // Create a mock user
  const createMockUser = () => {
    return {
      id: userId,
      email: 'test@example.com',
      password: 'hashedPassword',
      name: 'Test User',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    } as User;
  };

  // Create a mock otherTournamentMatches with modified properties while maintaining prototype
  const createMockMatchesWithDifferentTournament = (
    matches: Match[],
    differentTournamentId: string,
  ): Match[] => {
    return matches.map(match => {
      const newMatch = new Match(
        match.id,
        differentTournamentId,
        match.homePlayerOneId,
        match.homePlayerTwoId,
        match.awayPlayerOneId,
        match.awayPlayerTwoId,
        match.round,
        match.date,
        match.location,
        match.status,
        match.homeScore,
        match.awayScore,
        match.createdAt,
        match.updatedAt,
      );
      return newMatch;
    });
  };

  // Create mock matches for a user
  const createMockMatches = (count: number): Match[] => {
    const matches: Match[] = [];

    for (let i = 0; i < count; i++) {
      const match = new Match(
        `match-${i}`,
        tournamentId,
        i % 2 === 0 ? userId : `other-player-${i}-1`, // Home player 1 - user is in half the matches as home player
        `other-player-${i}-2`,
        i % 4 === 1 ? userId : `other-player-${i}-3`, // Away player 1 - user is in quarter of matches as away player
        `other-player-${i}-4`,
        Math.floor(i / 4) + 1, // Group matches into rounds
        new Date(`2023-${Math.floor(i / 10) + 1}-${(i % 10) + 1}`), // Different days across months
        `Court ${(i % 5) + 1}`,
        i % 5 === 0
          ? MatchStatus.PENDING
          : i % 5 === 1
            ? MatchStatus.SCHEDULED
            : i % 5 === 2
              ? MatchStatus.IN_PROGRESS
              : i % 5 === 3
                ? MatchStatus.COMPLETED
                : MatchStatus.CANCELED,
        i % 5 === 3 ? (i % 2 === 0 ? 3 : 1) : null, // Completed matches have scores, user wins when i is even
        i % 5 === 3 ? (i % 2 === 0 ? 1 : 3) : null, // User loses when i is odd
        new Date('2023-01-01'),
        new Date('2023-01-01'),
      );

      matches.push(match);
    }

    return matches;
  };

  test('should return paginated matches with default pagination', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMatches = createMockMatches(25);
    const defaultPageSize = 10;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

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
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    expect(mockMatchRepository.findByPlayerId).toHaveBeenCalledWith(userId);
  });

  test('should return paginated matches with custom pagination', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMatches = createMockMatches(25);
    const pageSize = 5;
    const page = 3;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      page,
      limit: pageSize,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

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

  test('should filter matches by WIN result', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMatches = createMockMatches(20);

    // Count expected winning matches (completed matches where user wins = even i values and status is COMPLETED)
    const expectedWinCount = mockMatches.filter(
      m => m.status === MatchStatus.COMPLETED && m.getWinnerIds()?.includes(userId),
    ).length;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      result: MatchResult.WIN,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      // Verify only winning matches are returned
      output.matches.forEach(match => {
        expect(match.status).toBe(MatchStatus.COMPLETED);
        expect(match.getWinnerIds()).toContain(userId);
      });
      expect(output.pagination.totalItems).toBe(expectedWinCount);
    }
  });

  test('should filter matches by LOSS result', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMatches = createMockMatches(20);

    // Count expected losing matches (completed matches where user loses = odd i values and status is COMPLETED)
    const expectedLossCount = mockMatches.filter(
      m =>
        m.status === MatchStatus.COMPLETED &&
        m.getWinnerIds() !== null &&
        !m.getWinnerIds()!.includes(userId),
    ).length;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      result: MatchResult.LOSS,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      // Verify only losing matches are returned
      output.matches.forEach(match => {
        expect(match.status).toBe(MatchStatus.COMPLETED);
        const winnerIds = match.getWinnerIds();
        expect(winnerIds).not.toBeNull();
        expect(winnerIds?.includes(userId)).toBe(false);
      });
      expect(output.pagination.totalItems).toBe(expectedLossCount);
    }
  });

  test('should filter matches by tournamentId', async () => {
    // Arrange
    const mockUser = createMockUser();
    const someMatches = createMockMatches(15);

    // Create some matches from a different tournament
    const differentTournamentId = '223e4567-e89b-12d3-a456-426614174222';
    const otherTournamentMatches = createMockMatchesWithDifferentTournament(
      someMatches.slice(0, 5),
      differentTournamentId,
    );

    const testTournamentMatches = someMatches.slice(5);
    const mockMatches = [...otherTournamentMatches, ...testTournamentMatches];

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      tournamentId,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      output.matches.forEach(match => {
        expect(match.tournamentId).toBe(tournamentId);
      });
      expect(output.pagination.totalItems).toBe(testTournamentMatches.length);
    }
  });

  test('should filter matches by date range - from date only', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMatches = createMockMatches(20);
    const fromDate = '2023-2-1'; // February 1, 2023

    // Calculate expected matches after date filtering
    const expectedMatchesCount = mockMatches.filter(
      m => m.date !== null && m.date >= new Date(fromDate),
    ).length;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      dateRange: {
        from: fromDate,
      },
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      output.matches.forEach(match => {
        expect(match.date).not.toBeNull();
        expect(match.date! >= new Date(fromDate)).toBe(true);
      });
      expect(output.pagination.totalItems).toBe(expectedMatchesCount);
    }
  });

  test('should filter matches by date range - to date only', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMatches = createMockMatches(20);
    const toDate = '2023-2-1'; // February 1, 2023

    // Calculate expected matches after date filtering
    const expectedMatchesCount = mockMatches.filter(
      m => m.date !== null && m.date <= new Date(toDate),
    ).length;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      dateRange: {
        to: toDate,
      },
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      output.matches.forEach(match => {
        expect(match.date).not.toBeNull();
        expect(match.date! <= new Date(toDate)).toBe(true);
      });
      expect(output.pagination.totalItems).toBe(expectedMatchesCount);
    }
  });

  test('should filter matches by date range - from and to dates', async () => {
    // Arrange
    const mockUser = createMockUser();
    const mockMatches = createMockMatches(20);
    const fromDate = '2023-1-15'; // January 15, 2023
    const toDate = '2023-2-15'; // February 15, 2023

    // Calculate expected matches after date filtering
    const expectedMatchesCount = mockMatches.filter(
      m => m.date !== null && m.date >= new Date(fromDate) && m.date <= new Date(toDate),
    ).length;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      dateRange: {
        from: fromDate,
        to: toDate,
      },
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      output.matches.forEach(match => {
        expect(match.date).not.toBeNull();
        expect(match.date! >= new Date(fromDate)).toBe(true);
        expect(match.date! <= new Date(toDate)).toBe(true);
      });
      expect(output.pagination.totalItems).toBe(expectedMatchesCount);
    }
  });

  test('should combine filters for result, tournament, and date range', async () => {
    // Arrange
    const mockUser = createMockUser();
    const someMatches = createMockMatches(30);

    // Create some matches from a different tournament
    const differentTournamentId = '223e4567-e89b-12d3-a456-426614174222';
    const otherTournamentMatches = createMockMatchesWithDifferentTournament(
      someMatches.slice(0, 10),
      differentTournamentId,
    );

    const testTournamentMatches = someMatches.slice(10);
    const mockMatches = [...otherTournamentMatches, ...testTournamentMatches];

    const fromDate = '2023-2-1'; // February 1, 2023

    // Calculate expected matches after combined filtering
    const expectedMatchesCount = mockMatches.filter(
      m =>
        m.tournamentId === tournamentId &&
        m.status === MatchStatus.COMPLETED &&
        m.getWinnerIds()?.includes(userId) &&
        m.date !== null &&
        m.date >= new Date(fromDate),
    ).length;

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue(mockMatches);

    const input: ListUserMatchesInput = {
      userId,
      tournamentId,
      result: MatchResult.WIN,
      dateRange: {
        from: fromDate,
      },
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      output.matches.forEach(match => {
        expect(match.tournamentId).toBe(tournamentId);
        expect(match.status).toBe(MatchStatus.COMPLETED);
        expect(match.getWinnerIds()).toContain(userId);
        expect(match.date).not.toBeNull();
        expect(match.date! >= new Date(fromDate)).toBe(true);
      });
      expect(output.pagination.totalItems).toBe(expectedMatchesCount);
    }
  });

  test('should return empty array when no matches are found', async () => {
    // Arrange
    const mockUser = createMockUser();

    mockUserRepository.findById.mockResolvedValue(mockUser);
    mockMatchRepository.findByPlayerId.mockResolvedValue([]);

    const input: ListUserMatchesInput = {
      userId,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      const output = result.getValue();
      expect(output.matches).toHaveLength(0);
      expect(output.pagination.totalItems).toBe(0);
      expect(output.pagination.totalPages).toBe(1);
      expect(output.pagination.hasNextPage).toBe(false);
      expect(output.pagination.hasPreviousPage).toBe(false);
    }
  });

  test('should fail when user is not found', async () => {
    // Arrange
    mockUserRepository.findById.mockResolvedValue(null);

    const input: ListUserMatchesInput = {
      userId,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('User not found');
    expect(mockMatchRepository.findByPlayerId).not.toHaveBeenCalled();
  });

  test('should fail with invalid user ID format', async () => {
    // Arrange
    const invalidInput = {
      userId: 'invalid-uuid',
    } as ListUserMatchesInput;

    // Act
    const result = await listUserMatchesUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid user ID format');
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.findByPlayerId).not.toHaveBeenCalled();
  });

  test('should fail with invalid pagination parameters', async () => {
    // Arrange
    const invalidInput = {
      userId,
      page: -1, // Invalid page number
      limit: 200, // Exceeds maximum limit
    } as ListUserMatchesInput;

    // Act
    const result = await listUserMatchesUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid input');
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.findByPlayerId).not.toHaveBeenCalled();
  });

  test('should fail with invalid date format', async () => {
    // Arrange
    const invalidInput = {
      userId,
      dateRange: {
        from: 'invalid-date',
      },
    } as ListUserMatchesInput;

    // Act
    const result = await listUserMatchesUseCase.execute(invalidInput);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('Invalid from date format');
    expect(mockUserRepository.findById).not.toHaveBeenCalled();
    expect(mockMatchRepository.findByPlayerId).not.toHaveBeenCalled();
  });

  test('should handle repository errors', async () => {
    // Arrange
    const errorMessage = 'Database error';
    mockUserRepository.findById.mockRejectedValue(new Error(errorMessage));

    const input: ListUserMatchesInput = {
      userId,
    };

    // Act
    const result = await listUserMatchesUseCase.execute(input);

    // Assert
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain(errorMessage);
    expect(mockMatchRepository.findByPlayerId).not.toHaveBeenCalled();
  });
});
