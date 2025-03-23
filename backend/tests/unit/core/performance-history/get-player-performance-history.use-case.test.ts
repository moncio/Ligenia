import { PerformanceHistory } from '@prisma/client';
import {
  IPerformanceHistoryRepository,
  PerformanceHistoryFilter,
  PerformanceSummary,
  PerformanceTrend,
} from '../../../../src/core/application/interfaces/repositories/performance-history.repository';
import {
  GetPlayerPerformanceHistoryUseCase,
  GetPlayerPerformanceHistoryInput,
} from '../../../../src/core/application/use-cases/performance-history/get-player-performance-history.use-case';

// Mock repository implementation
class MockPerformanceHistoryRepository implements IPerformanceHistoryRepository {
  private mockData: PerformanceHistory[] = [
    {
      id: 'perf-1',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      year: 2023,
      month: 1,
      matchesPlayed: 10,
      wins: 7,
      losses: 3,
      points: 21,
      createdAt: new Date('2023-01-31'),
      updatedAt: new Date('2023-01-31'),
    },
    {
      id: 'perf-2',
      userId: '123e4567-e89b-12d3-a456-426614174000',
      year: 2023,
      month: 2,
      matchesPlayed: 8,
      wins: 5,
      losses: 3,
      points: 15,
      createdAt: new Date('2023-02-28'),
      updatedAt: new Date('2023-02-28'),
    },
    {
      id: 'perf-3',
      userId: '223e4567-e89b-12d3-a456-426614174000',
      year: 2023,
      month: 1,
      matchesPlayed: 6,
      wins: 3,
      losses: 3,
      points: 9,
      createdAt: new Date('2023-01-31'),
      updatedAt: new Date('2023-01-31'),
    },
  ];

  async create(
    data: Omit<PerformanceHistory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PerformanceHistory> {
    const newEntry: PerformanceHistory = {
      id: 'mock-id-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.mockData.push(newEntry);
    return newEntry;
  }

  async findById(id: string): Promise<PerformanceHistory | null> {
    const entry = this.mockData.find(item => item.id === id);
    return entry || null;
  }

  async findByUserId(
    userId: string,
    filter?: PerformanceHistoryFilter,
  ): Promise<PerformanceHistory[]> {
    let result = this.mockData.filter(item => item.userId === userId);

    if (filter?.year !== undefined) {
      result = result.filter(item => item.year === filter.year);
    }

    if (filter?.month !== undefined) {
      result = result.filter(item => item.month === filter.month);
    }

    // Implement pagination if required
    if (filter?.limit !== undefined || filter?.offset !== undefined) {
      const offset = filter?.offset || 0;
      const limit = filter?.limit || result.length;
      result = result.slice(offset, offset + limit);
    }

    return result;
  }

  async update(id: string, data: Partial<PerformanceHistory>): Promise<PerformanceHistory> {
    const index = this.mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Performance history entry not found');
    }

    const updatedEntry = {
      ...this.mockData[index],
      ...data,
      updatedAt: new Date(),
    };

    this.mockData[index] = updatedEntry;
    return updatedEntry;
  }

  async delete(id: string): Promise<void> {
    const index = this.mockData.findIndex(item => item.id === id);
    if (index !== -1) {
      this.mockData.splice(index, 1);
    }
  }

  async findPerformanceSummary(userId: string, year?: number): Promise<PerformanceSummary> {
    return {
      userId,
      year,
      totalMatches: 10,
      totalWins: 7,
      totalLosses: 3,
      winRate: 70,
      avgPointsPerMonth: 15,
    };
  }

  async findPerformanceTrends(userId: string, timeframe?: string): Promise<PerformanceTrend[]> {
    return [{ period: 'Jan', matchesPlayed: 3, wins: 2, losses: 1, points: 6 }];
  }

  // Helper method for tests to set mock data
  setMockData(data: PerformanceHistory[]): void {
    this.mockData = [...data];
  }
}

describe('GetPlayerPerformanceHistoryUseCase', () => {
  let useCase: GetPlayerPerformanceHistoryUseCase;
  let repository: MockPerformanceHistoryRepository;

  beforeEach(() => {
    repository = new MockPerformanceHistoryRepository();
    useCase = new GetPlayerPerformanceHistoryUseCase(repository);
  });

  // Helper function to create a valid input
  const createValidInput = (): GetPlayerPerformanceHistoryInput => ({
    userId: '123e4567-e89b-12d3-a456-426614174000',
    year: 2023,
  });

  describe('Get player performance history', () => {
    test('should retrieve all performance history for a user', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      } as GetPlayerPerformanceHistoryInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const history = result.getValue();
      expect(history).toHaveLength(2);
      expect(history[0].userId).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(history[1].userId).toBe('123e4567-e89b-12d3-a456-426614174000');
    });

    test('should filter by year', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2023,
      } as GetPlayerPerformanceHistoryInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const history = result.getValue();
      expect(history).toHaveLength(2);
      expect(history[0].year).toBe(2023);
      expect(history[1].year).toBe(2023);
    });

    test('should filter by month', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        month: 1,
      } as GetPlayerPerformanceHistoryInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const history = result.getValue();
      expect(history).toHaveLength(1);
      expect(history[0].month).toBe(1);
    });

    test('should apply pagination with limit and offset', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 1,
        offset: 1,
      } as GetPlayerPerformanceHistoryInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const history = result.getValue();
      expect(history).toHaveLength(1);
      expect(history[0].id).toBe('perf-2'); // should get the second item due to offset
    });

    test('should return empty array if no matching records', async () => {
      // Arrange
      const input = {
        userId: '323e4567-e89b-12d3-a456-426614174000', // Non-existent UUID
      } as GetPlayerPerformanceHistoryInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess).toBe(true);
      const history = result.getValue();
      expect(history).toHaveLength(0);
    });
  });

  describe('Validation', () => {
    test('should fail with invalid userId', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        userId: 'invalid-uuid',
      };

      // Act
      const result = await useCase.execute(input as any);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toContain('Invalid user ID format');
    });

    test('should fail with year out of range', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        year: 1999, // Out of valid range
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure).toBe(true);
    });

    test('should fail with invalid month', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        month: 13, // Invalid month
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure).toBe(true);
    });

    test('should fail with negative limit', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        limit: -1, // Invalid limit
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should handle repository errors', async () => {
      // Arrange
      const input = createValidInput();
      jest.spyOn(repository, 'findByUserId').mockImplementation(() => {
        throw new Error('Database connection error');
      });

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure).toBe(true);
      expect(result.getError().message).toBe('Database connection error');
    });
  });
});
