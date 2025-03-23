import { PerformanceHistory } from '@prisma/client';
import { IPerformanceHistoryRepository, PerformanceHistoryFilter, PerformanceSummary, PerformanceTrend } from '../../../../src/core/application/interfaces/repositories/performance-history.repository';
import { TrackPerformanceTrendsUseCase, TrackPerformanceTrendsInput } from '../../../../src/core/application/use-cases/performance-history/track-performance-trends.use-case';

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
    return {
      userId,
      year,
      totalMatches: 10,
      totalWins: 7,
      totalLosses: 3,
      winRate: 70,
      avgPointsPerMonth: 15
    };
  }

  async findPerformanceTrends(userId: string, timeframe?: string): Promise<PerformanceTrend[]> {
    if (userId === 'error-user-id') {
      throw new Error('Failed to fetch trends');
    }
    
    // Return different results based on timeframe
    if (timeframe === 'monthly') {
      return [
        { period: 'Jan', matchesPlayed: 4, wins: 3, losses: 1, points: 9 },
        { period: 'Feb', matchesPlayed: 6, wins: 4, losses: 2, points: 12 },
        { period: 'Mar', matchesPlayed: 5, wins: 2, losses: 3, points: 6 }
      ];
    }
    
    if (timeframe === 'yearly') {
      return [
        { period: '2022', matchesPlayed: 35, wins: 20, losses: 15, points: 60 },
        { period: '2023', matchesPlayed: 42, wins: 28, losses: 14, points: 84 }
      ];
    }
    
    // Default (all)
    return [
      { period: 'All-time', matchesPlayed: 120, wins: 75, losses: 45, points: 225 }
    ];
  }
}

describe('TrackPerformanceTrendsUseCase', () => {
  let useCase: TrackPerformanceTrendsUseCase;
  let repository: MockPerformanceHistoryRepository;

  beforeEach(() => {
    repository = new MockPerformanceHistoryRepository();
    useCase = new TrackPerformanceTrendsUseCase(repository);
  });

  // Helper function to create a valid input
  const createValidInput = (): TrackPerformanceTrendsInput => ({
    userId: '123e4567-e89b-12d3-a456-426614174000'
  });

  describe('Track performance trends', () => {
    test('should retrieve monthly performance trends by default', async () => {
      // Arrange
      const input = createValidInput();
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const trends = result.getValue();
      expect(trends.length).toBe(3); // 3 months
      expect(trends[0].period).toBe('Jan');
      expect(trends[1].period).toBe('Feb');
      expect(trends[2].period).toBe('Mar');
    });

    test('should retrieve yearly performance trends', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        timeframe: 'yearly' as const
      };
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const trends = result.getValue();
      expect(trends.length).toBe(2); // 2 years
      expect(trends[0].period).toBe('2022');
      expect(trends[1].period).toBe('2023');
    });

    test('should retrieve all-time performance trend', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        timeframe: 'all' as const
      };
      
      // Act
      const result = await useCase.execute(input);
      
      // Assert
      expect(result.isSuccess).toBe(true);
      const trends = result.getValue();
      expect(trends.length).toBe(1); // All-time summary
      expect(trends[0].period).toBe('All-time');
      expect(trends[0].matchesPlayed).toBe(120);
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

    test('should fail with invalid timeframe', async () => {
      // Arrange
      const input = {
        ...createValidInput(),
        timeframe: 'invalid-timeframe'
      };
      
      // Act
      const result = await useCase.execute(input as any);
      
      // Assert
      expect(result.isFailure).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('should handle repository errors', async () => {
      // Arrange
      const input = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        timeframe: 'monthly' as const
      };
      
      // Mock repository to throw an error
      jest.spyOn(repository, 'findPerformanceTrends').mockImplementation(() => {
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