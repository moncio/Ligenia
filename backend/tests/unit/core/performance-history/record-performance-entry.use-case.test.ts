import { PerformanceHistory } from '@prisma/client';
import { IPerformanceHistoryRepository } from '../../../../src/core/application/interfaces/repositories/performance-history.repository';
import {
  RecordPerformanceEntryUseCase,
  RecordPerformanceEntryInput,
} from '../../../../src/core/application/use-cases/performance-history/record-performance-entry.use-case';

// Mock repository implementation
class MockPerformanceHistoryRepository implements IPerformanceHistoryRepository {
  private mockData: PerformanceHistory[] = [];

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

  async findByUserId(userId: string, filter?: any): Promise<PerformanceHistory[]> {
    return this.mockData.filter(item => {
      if (item.userId !== userId) return false;
      if (filter?.year && item.year !== filter.year) return false;
      if (filter?.month && item.month !== filter.month) return false;
      return true;
    });
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

  async findPerformanceSummary(userId: string, year?: number): Promise<any> {
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

  async findPerformanceTrends(userId: string, timeframe?: string): Promise<any[]> {
    return [{ period: 'Jan', matchesPlayed: 3, wins: 2, losses: 1, points: 6 }];
  }

  // Helper method for tests to set mock data
  setMockData(data: PerformanceHistory[]): void {
    this.mockData = [...data];
  }
}

describe('RecordPerformanceEntryUseCase', () => {
  let useCase: RecordPerformanceEntryUseCase;
  let repository: MockPerformanceHistoryRepository;

  beforeEach(() => {
    repository = new MockPerformanceHistoryRepository();
    useCase = new RecordPerformanceEntryUseCase(repository);
  });

  // Helper function to create a valid input
  const createValidInput = (): RecordPerformanceEntryInput => ({
    userId: '123e4567-e89b-12d3-a456-426614174000',
    year: 2023,
    month: 6,
    matchesPlayed: 5,
    wins: 3,
    losses: 2,
    points: 9,
  });

  describe('Create new performance entry', () => {
    test('should create a new performance entry successfully', async () => {
      // Arrange
      const input = createValidInput();

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const performanceEntry = result.getValue();
      expect(performanceEntry).toBeDefined();
      expect(performanceEntry.userId).toBe(input.userId);
      expect(performanceEntry.year).toBe(input.year);
      expect(performanceEntry.month).toBe(input.month);
      expect(performanceEntry.matchesPlayed).toBe(input.matchesPlayed);
      expect(performanceEntry.wins).toBe(input.wins);
      expect(performanceEntry.losses).toBe(input.losses);
      expect(performanceEntry.points).toBe(input.points);
    });

    test('should create entry with default values for optional fields', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2023,
      } as RecordPerformanceEntryInput;

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const performanceEntry = result.getValue();
      expect(performanceEntry.matchesPlayed).toBe(0);
      expect(performanceEntry.wins).toBe(0);
      expect(performanceEntry.losses).toBe(0);
      expect(performanceEntry.points).toBe(0);
    });
  });

  describe('Update existing performance entry', () => {
    test('should update an existing performance entry', async () => {
      // Arrange
      const existingEntry: PerformanceHistory = {
        id: 'existing-id',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        year: 2023,
        month: 6,
        matchesPlayed: 3,
        wins: 1,
        losses: 2,
        points: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.setMockData([existingEntry]);

      const input: RecordPerformanceEntryInput = {
        userId: existingEntry.userId,
        year: existingEntry.year,
        month: existingEntry.month,
        matchesPlayed: 5,
        wins: 3,
        losses: 2,
        points: 9,
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isSuccess()).toBe(true);
      const updatedEntry = result.getValue();
      expect(updatedEntry.id).toBe(existingEntry.id);
      expect(updatedEntry.matchesPlayed).toBe(input.matchesPlayed);
      expect(updatedEntry.wins).toBe(input.wins);
      expect(updatedEntry.losses).toBe(input.losses);
      expect(updatedEntry.points).toBe(input.points);
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
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toContain('Invalid user ID format');
    });

    test('should fail with year out of range', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        year: 1999, // Below min value
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
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
      expect(result.isFailure()).toBe(true);
    });

    test('should fail with negative values', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        matchesPlayed: -1, // Negative value
      };

      // Act
      const result = await useCase.execute(input);

      // Assert
      expect(result.isFailure()).toBe(true);
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
      expect(result.isFailure()).toBe(true);
      expect(result.getError().message).toBe('Database connection error');
    });
  });
});
