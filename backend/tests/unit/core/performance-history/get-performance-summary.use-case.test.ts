import { PerformanceHistory } from '@prisma/client';
import { IPerformanceHistoryRepository, PerformanceHistoryFilter, PerformanceSummary, PerformanceTrend } from '../../../../src/core/application/interfaces/repositories/performance-history.repository';
import { GetPerformanceSummaryUseCase, GetPerformanceSummaryInput } from '../../../../src/core/application/use-cases/performance-history/get-performance-summary.use-case';

// Mock repository implementation
class MockPerformanceHistoryRepository implements IPerformanceHistoryRepository {
  private mockData: PerformanceHistory[] = [];

  async create(data: Omit<PerformanceHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<PerformanceHistory> {
    const newEntry: PerformanceHistory = {
      id: 'mock-id-' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data
    };
    this.mockData.push(newEntry);
    return newEntry;
  }

  async findById(id: string): Promise<PerformanceHistory | null> {
    const entry = this.mockData.find(item => item.id === id);
    return entry || null;
  }

  async findByUserId(userId: string, filter?: PerformanceHistoryFilter): Promise<PerformanceHistory[]> {
    let result = this.mockData.filter(item => item.userId === userId);
    
    if (filter?.year !== undefined) {
      result = result.filter(item => item.year === filter.year);
    }
    
    if (filter?.month !== undefined) {
      result = result.filter(item => item.month === filter.month);
    }
    
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
      updatedAt: new Date()
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
    if (userId === 'non-existent-uuid') {
      throw new Error('User not found');
    }
    
    // Return different results based on input to test behavior
    return {
      userId,
      year,
      totalMatches: 10,
      totalWins: 7,
      totalLosses: 3,
      winRate: 70,
      avgPointsPerMonth: 15,
      bestMonth: year ? {
        month: 3,
        wins: 3,
        points: 9
      } : undefined
    };
  }

  async findPerformanceTrends(userId: string, timeframe?: string): Promise<PerformanceTrend[]> {
    return [
      { period: 'Jan', matchesPlayed: 3, wins: 2, losses: 1, points: 6 }
    ];
  }
}

describe('GetPerformanceSummaryUseCase', () => {
  let useCase: GetPerformanceSummaryUseCase;
  let repository: MockPerformanceHistoryRepository;

  beforeEach(() => {
    repository = new MockPerformanceHistoryRepository();
    useCase = new GetPerformanceSummaryUseCase(repository);
  });

  // Helper function to create a valid input
  const createValidInput = (): GetPerformanceSummaryInput => ({
    userId: '123e4567-e89b-12d3-a456-426614174000'
  });

  describe('Get performance summary', () => {
    test('should retrieve performance summary for a player', async () => {
      // Arrange
      const input = createValidInput();
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const summary = result.getValue();
      expect(summary.userId).toBe(input.userId);
      expect(summary.totalMatches).toBe(10);
      expect(summary.winRate).toBe(70);
    });

    test('should retrieve filtered performance summary by year', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        year: 2023
      };
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const summary = result.getValue();
      expect(summary.userId).toBe(input.userId);
      expect(summary.year).toBe(input.year);
      expect(summary.bestMonth).toBeDefined();
      expect(summary.bestMonth?.month).toBe(3);
    });

    test('should accept year as string input', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        year: '2023'
      } as any; // Type cast to any since we're testing string input
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const summary = result.getValue();
      expect(summary.year).toBe(2023); // Should be parsed to number
      expect(summary.bestMonth).toBeDefined();
    });
  });

  describe('Validation', () => {
    test('should fail with invalid userId', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        userId: 'invalid-uuid'
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
        year: 1999 // Out of valid range
      };
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
    });

    test('should fail with invalid year format', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        year: 'not-a-year'
      } as any;
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isFailure).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should handle repository errors', async () => {
      // Arrange
      const validUserId = '123e4567-e89b-12d3-a456-426614174001';
      const input = {
        userId: validUserId,
      } as GetPerformanceSummaryInput;
      
      // Mock the repository to throw an error
      jest.spyOn(repository, 'findPerformanceSummary').mockImplementation(() => {
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