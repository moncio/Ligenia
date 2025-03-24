import { Container } from 'inversify';
import { Result } from '../../src/shared/result';
import { UserRole } from '../../src/core/domain/user/user.entity';
import { MatchStatus } from '../../src/core/domain/match/match.entity';

/**
 * Mock use cases for testing
 */
const createMockUserUseCases = () => {
  return {
    getUserByIdUseCase: {
      execute: jest.fn().mockImplementation(({ id }) => {
        console.log('[MOCK] getUserByIdUseCase executed with id:', id);
        // Mock user data for testing
        if (id && id !== '00000000-0000-0000-0000-000000000000') {
          const result = Result.ok({
            id,
            name: 'Test User',
            email: 'test@example.com',
            role: UserRole.PLAYER
          });
          console.log('[MOCK] getUserByIdUseCase returning success result:', JSON.stringify(result));
          return Promise.resolve(result);
        }
        const error = new Error('User not found');
        console.log('[MOCK] getUserByIdUseCase returning failure result for id:', id);
        return Promise.resolve(Result.fail(error));
      })
    },
    listUsersUseCase: {
      execute: jest.fn().mockImplementation((params) => {
        console.log('[MOCK] listUsersUseCase executed with params:', params);
        
        const limit = params?.limit || 10;
        const offset = params?.offset || 0;
        
        console.log('[MOCK] listUsersUseCase creating mock data with limit:', limit, 'offset:', offset);
        
        // Create mock users
        const mockUsers = [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            name: 'Test User 1',
            email: 'test1@example.com',
            role: UserRole.PLAYER
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            name: 'Test User 2',
            email: 'test2@example.com',
            role: UserRole.ADMIN
          }
        ];
        
        const result = Result.ok({
          users: mockUsers,
          total: mockUsers.length,
          limit,
          offset
        });
        
        console.log('[MOCK] listUsersUseCase returning result:', JSON.stringify(result));
        console.log('[MOCK] listUsersUseCase result isSuccess():', result.isSuccess());
        console.log('[MOCK] listUsersUseCase result getValue():', JSON.stringify(result.getValue()));
        
        return Promise.resolve(result);
      })
    },
    updateUserUseCase: {
      execute: jest.fn().mockImplementation(({ id, ...data }) => {
        console.log('[MOCK] updateUserUseCase executed with params:', { id, ...data });
        // Return updated user
        if (id && id !== '00000000-0000-0000-0000-000000000000') {
          const result = Result.ok({
            id,
            ...data,
            email: data.email || 'test@example.com',
            name: data.name || 'Test User',
            role: data.role || UserRole.PLAYER
          });
          console.log('[MOCK] updateUserUseCase returning success result:', JSON.stringify(result));
          return Promise.resolve(result);
        }
        const error = new Error('User not found');
        console.log('[MOCK] updateUserUseCase returning failure result for id:', id);
        return Promise.resolve(Result.fail(error));
      })
    },
    deleteUserUseCase: {
      execute: jest.fn().mockImplementation(({ id }) => {
        console.log('[MOCK] deleteUserUseCase executed with id:', id);
        if (id && id !== '00000000-0000-0000-0000-000000000000') {
          const result = Result.ok(true);
          console.log('[MOCK] deleteUserUseCase returning success result:', JSON.stringify(result));
          return Promise.resolve(result);
        }
        const error = new Error('User not found');
        console.log('[MOCK] deleteUserUseCase returning failure result for id:', id);
        return Promise.resolve(Result.fail(error));
      })
    },
    registerUserUseCase: {
      execute: jest.fn().mockImplementation((data) => {
        console.log('[MOCK] registerUserUseCase executed with data:', data);
        const result = Result.ok({
          id: '123e4567-e89b-12d3-a456-426614174003',
          ...data
        });
        console.log('[MOCK] registerUserUseCase returning result:', JSON.stringify(result));
        return Promise.resolve(result);
      })
    },
    // Add additional use cases for user statistics, preferences, etc.
    getUserStatisticsUseCase: {
      execute: jest.fn().mockImplementation(({ userId }) => {
        console.log('[MOCK] getUserStatisticsUseCase executed with userId:', userId);
        if (userId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('User not found');
          console.log('[MOCK] getUserStatisticsUseCase returning failure result for userId:', userId);
          return Promise.resolve(Result.fail(error));
        }
        const result = Result.ok({
          userId,
          wins: 10,
          losses: 5,
          draws: 2,
          totalMatches: 17,
          winRate: 0.59
        });
        console.log('[MOCK] getUserStatisticsUseCase returning success result for userId:', userId);
        return Promise.resolve(result);
      })
    },
    getUserPreferencesUseCase: {
      execute: jest.fn().mockImplementation(({ userId }) => {
        console.log('[MOCK] getUserPreferencesUseCase executed with userId:', userId);
        const result = Result.ok({
          userId,
          theme: 'dark',
          notificationsEnabled: true,
          language: 'en'
        });
        console.log('[MOCK] getUserPreferencesUseCase returning success result for userId:', userId);
        return Promise.resolve(result);
      })
    },
    updateUserPreferencesUseCase: {
      execute: jest.fn().mockImplementation(({ userId, ...data }) => {
        console.log('[MOCK] updateUserPreferencesUseCase executed with params:', { userId, ...data });
        const result = Result.ok({
          userId,
          ...data
        });
        console.log('[MOCK] updateUserPreferencesUseCase returning success result for userId:', userId);
        return Promise.resolve(result);
      })
    },
    changePasswordUseCase: {
      execute: jest.fn().mockImplementation(({ userId, currentPassword, newPassword }) => {
        console.log('[MOCK] changePasswordUseCase executed with userId:', userId);
        if (currentPassword === 'invalid') {
          const error = new Error('Current password is incorrect');
          console.log('[MOCK] changePasswordUseCase returning failure result for userId:', userId);
          return Promise.resolve(Result.fail(error));
        }
        const result = Result.ok(true);
        console.log('[MOCK] changePasswordUseCase returning success result for userId:', userId);
        return Promise.resolve(result);
      })
    },
    getUserPerformanceUseCase: {
      execute: jest.fn().mockImplementation(({ userId }) => {
        console.log('[MOCK] getUserPerformanceUseCase executed with userId:', userId);
        const result = Result.ok([
          { date: '2023-01-01', score: 1200 },
          { date: '2023-02-01', score: 1250 },
          { date: '2023-03-01', score: 1300 }
        ]);
        console.log('[MOCK] getUserPerformanceUseCase returning success result for userId:', userId);
        return Promise.resolve(result);
      })
    },
    getMatchHistoryUseCase: {
      execute: jest.fn().mockImplementation(({ userId }) => {
        console.log('[MOCK] getMatchHistoryUseCase executed with userId:', userId);
        const result = Result.ok([
          { id: '1', date: '2023-01-01', result: 'win', opponent: 'Player 1' },
          { id: '2', date: '2023-02-01', result: 'loss', opponent: 'Player 2' },
          { id: '3', date: '2023-03-01', result: 'win', opponent: 'Player 3' }
        ]);
        console.log('[MOCK] getMatchHistoryUseCase returning success result for userId:', userId);
        return Promise.resolve(result);
      })
    }
  };
};

/**
 * Mock tournament use cases for testing
 */
const createMockTournamentUseCases = () => {
  return {
    // Add tournament related mock use cases
    listTournamentMatchesUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId, page = 1, limit = 10, status, round }) => {
        console.log('[MOCK] listTournamentMatchesUseCase executed with params:', { tournamentId, page, limit, status, round });
        
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] listTournamentMatchesUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        
        // Create mock matches
        let mockMatches = [
          {
            id: 'match1',
            tournamentId,
            homePlayerOneId: 'player1',
            homePlayerTwoId: 'player2',
            awayPlayerOneId: 'player3',
            awayPlayerTwoId: 'player4',
            round: 1,
            status: MatchStatus.COMPLETED,
            date: new Date('2023-07-10T10:00:00Z'),
            location: 'Court 1',
            homeScore: 6,
            awayScore: 4,
          },
          {
            id: 'match2',
            tournamentId,
            homePlayerOneId: 'player5',
            homePlayerTwoId: 'player6',
            awayPlayerOneId: 'player7',
            awayPlayerTwoId: 'player8',
            round: 1,
            status: MatchStatus.SCHEDULED,
            date: new Date('2023-07-10T12:00:00Z'),
            location: 'Court 2',
            homeScore: null,
            awayScore: null,
          },
          {
            id: 'match3',
            tournamentId,
            homePlayerOneId: 'player1',
            homePlayerTwoId: 'player2',
            awayPlayerOneId: 'player5',
            awayPlayerTwoId: 'player6',
            round: 2,
            status: MatchStatus.PENDING,
            date: null,
            location: null,
            homeScore: null,
            awayScore: null,
          },
        ];
        
        // Apply filters if provided
        if (status !== undefined) {
          mockMatches = mockMatches.filter(match => match.status === status);
        }
        
        if (round !== undefined) {
          mockMatches = mockMatches.filter(match => match.round === round);
        }
        
        // Pagination
        const totalItems = mockMatches.length;
        const totalPages = Math.ceil(totalItems / limit);
        
        // Get paginated matches
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedMatches = mockMatches.slice(startIndex, endIndex);
        
        const result = Result.ok({
          matches: paginatedMatches,
          pagination: {
            totalItems,
            itemsPerPage: limit,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          }
        });
        
        console.log('[MOCK] listTournamentMatchesUseCase returning success result');
        return Promise.resolve(result);
      })
    },
  };
};

/**
 * Mock performance history use cases for testing
 */
const createMockPerformanceUseCases = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  return {
    getPlayerPerformanceHistoryUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, year, month }) => {
        console.log('[MOCK] getPlayerPerformanceHistoryUseCase executed with:', { playerId, year, month });
        
        // Handle non-existent players
        if (playerId === '00000000-0000-0000-0000-000000000000') {
          return Promise.resolve(Result.ok({ performance: [] }));
        }
        
        // If player ID is invalid format, this won't be called due to validation middleware
        const mockPerformanceHistory = [
          {
            id: 'perf-1',
            playerId,
            year: year || currentYear,
            month: month || currentMonth,
            matchesPlayed: 10,
            wins: 7,
            losses: 3,
            points: 21,
            winRate: 70
          },
          {
            id: 'perf-2',
            playerId,
            year: year || currentYear,
            month: (month || currentMonth) - 1 || 12,
            matchesPlayed: 8,
            wins: 5,
            losses: 3,
            points: 15,
            winRate: 62.5
          }
        ];
        
        // Filter by year if provided
        let filteredHistory = mockPerformanceHistory;
        if (year) {
          filteredHistory = filteredHistory.filter(p => p.year === parseInt(year));
        }
        
        // Filter by month if provided
        if (month) {
          filteredHistory = filteredHistory.filter(p => p.month === parseInt(month));
        }
        
        return Promise.resolve(Result.ok({ performance: filteredHistory }));
      })
    },
    
    getPerformanceSummaryUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, userId, year }) => {
        console.log('[MOCK] getPerformanceSummaryUseCase executed with:', { playerId, userId, year });
        
        // Handle non-existent players
        if (playerId === '00000000-0000-0000-0000-000000000000' || 
            userId === '00000000-0000-0000-0000-000000000000') {
          return Promise.resolve(Result.ok({ summary: { 
            totalMatches: 0,
            totalWins: 0,
            totalLosses: 0,
            totalPoints: 0,
            winRate: 0,
            averagePointsPerMatch: 0,
            bestMonth: null
          }}));
        }
        
        const mockSummary = {
          totalMatches: 33,
          totalWins: 22,
          totalLosses: 11,
          totalPoints: 66,
          winRate: 66.67,
          averagePointsPerMatch: 2,
          userId: userId || playerId || 'user1',
          bestMonth: {
            month: 2,
            year: 2023,
            wins: 12,
            winRate: 66.67
          }
        };
        
        // Add year property if requested
        if (year) {
          return Promise.resolve(Result.ok({ 
            summary: {
              ...mockSummary,
              year: parseInt(year)
            } 
          }));
        }
        
        return Promise.resolve(Result.ok({ summary: mockSummary }));
      })
    },
    
    trackPerformanceTrendsUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, timeframe }) => {
        console.log('[MOCK] trackPerformanceTrendsUseCase executed with:', { playerId, timeframe });
        
        // Handle non-existent players
        if (playerId === '00000000-0000-0000-0000-000000000000') {
          return Promise.resolve(Result.ok({ trends: [] }));
        }
        
        const mockTrends = [
          {
            period: timeframe === 'yearly' ? '2023' : '2023-01',
            winRate: 65.5,
            matchesPlayed: 20,
            averagePoints: 2.3
          },
          {
            period: timeframe === 'yearly' ? '2022' : '2023-02',
            winRate: 58.3,
            matchesPlayed: 18,
            averagePoints: 1.9
          },
          {
            period: timeframe === 'yearly' ? '2021' : '2023-03',
            winRate: 70.0,
            matchesPlayed: 22,
            averagePoints: 2.5
          }
        ];
        
        return Promise.resolve(Result.ok({ trends: mockTrends }));
      })
    },
    
    recordPerformanceEntryUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, ...performanceData }) => {
        console.log('[MOCK] recordPerformanceEntryUseCase executed with:', { playerId, ...performanceData });
        
        // Handle non-existent players
        if (playerId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Player not found');
          return Promise.resolve(Result.fail(error));
        }
        
        const mockPerformance = {
          id: 'perf-' + Math.random().toString(36).substring(2, 9),
          playerId,
          year: performanceData.year || currentYear,
          month: performanceData.month || currentMonth,
          matchesPlayed: performanceData.matchesPlayed || 0,
          wins: performanceData.wins || 0,
          losses: performanceData.losses || 0,
          points: performanceData.points || 0,
          winRate: performanceData.wins && performanceData.matchesPlayed ? 
                  (performanceData.wins / performanceData.matchesPlayed * 100) : 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return Promise.resolve(Result.ok({ performance: mockPerformance }));
      })
    }
  };
};

/**
 * Mock preference use cases for testing
 */
const createMockPreferenceUseCases = () => {
  return {
    getUserPreferencesUseCase: {
      execute: jest.fn().mockImplementation(({ userId }) => {
        console.log('[MOCK] getUserPreferencesUseCase executed with userId:', userId);
        
        // Handle non-existent users
        if (userId === '00000000-0000-0000-0000-000000000000') {
          return Promise.resolve(Result.ok(null));
        }
        
        // Test error case
        if (userId === 'error-user-id') {
          const error = new Error('Failed to get user preferences');
          return Promise.resolve(Result.fail(error));
        }
        
        const mockPreferences = {
          id: 'pref-' + Math.random().toString(36).substring(2, 9),
          userId,
          theme: 'system',
          fontSize: 16,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return Promise.resolve(Result.ok(mockPreferences));
      })
    },
    
    updateUserPreferencesUseCase: {
      execute: jest.fn().mockImplementation(({ userId, ...data }) => {
        console.log('[MOCK] updateUserPreferencesUseCase executed with data:', { userId, ...data });
        
        // Handle non-existent users
        if (userId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('User not found');
          return Promise.resolve(Result.fail(error));
        }
        
        // Test error case
        if (userId === 'error-user-id') {
          const error = new Error('Failed to update user preferences');
          return Promise.resolve(Result.fail(error));
        }
        
        const mockPreferences = {
          id: 'pref-' + Math.random().toString(36).substring(2, 9),
          userId,
          theme: data.theme || 'system',
          fontSize: data.fontSize || 16,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return Promise.resolve(Result.ok(mockPreferences));
      })
    },
    
    resetPreferencesUseCase: {
      execute: jest.fn().mockImplementation(({ userId }) => {
        console.log('[MOCK] resetPreferencesUseCase executed with userId:', userId);
        
        // Handle non-existent users
        if (userId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('User not found');
          return Promise.resolve(Result.fail(error));
        }
        
        // Test error case
        if (userId === 'error-user-id') {
          const error = new Error('Failed to reset user preferences');
          return Promise.resolve(Result.fail(error));
        }
        
        const mockPreferences = {
          id: 'pref-' + Math.random().toString(36).substring(2, 9),
          userId,
          theme: 'system', // Default theme
          fontSize: 16,    // Default font size
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        return Promise.resolve(Result.ok(mockPreferences));
      })
    }
  };
};

/**
 * Create a mock DI container for testing
 */
export const createMockContainer = () => {
  const container = new Container();
  const mockUserUseCases = createMockUserUseCases();
  const mockTournamentUseCases = createMockTournamentUseCases();
  const mockPerformanceUseCases = createMockPerformanceUseCases();
  const mockPreferenceUseCases = createMockPreferenceUseCases();
  
  // Bind mock user use cases
  container.bind('getUserByIdUseCase').toConstantValue(mockUserUseCases.getUserByIdUseCase);
  container.bind('listUsersUseCase').toConstantValue(mockUserUseCases.listUsersUseCase);
  container.bind('updateUserUseCase').toConstantValue(mockUserUseCases.updateUserUseCase);
  container.bind('deleteUserUseCase').toConstantValue(mockUserUseCases.deleteUserUseCase);
  container.bind('registerUserUseCase').toConstantValue(mockUserUseCases.registerUserUseCase);
  container.bind('getUserStatisticsUseCase').toConstantValue(mockUserUseCases.getUserStatisticsUseCase);
  container.bind('getUserPreferencesUseCase').toConstantValue(mockUserUseCases.getUserPreferencesUseCase);
  container.bind('updateUserPreferencesUseCase').toConstantValue(mockUserUseCases.updateUserPreferencesUseCase);
  container.bind('changePasswordUseCase').toConstantValue(mockUserUseCases.changePasswordUseCase);
  container.bind('getUserPerformanceUseCase').toConstantValue(mockUserUseCases.getUserPerformanceUseCase);
  container.bind('getMatchHistoryUseCase').toConstantValue(mockUserUseCases.getMatchHistoryUseCase);
  
  // Bind mock tournament use cases
  container.bind('listTournamentMatchesUseCase').toConstantValue(mockTournamentUseCases.listTournamentMatchesUseCase);
  
  // Bind mock performance use cases
  container.bind('trackPerformanceTrendsUseCase').toConstantValue(mockPerformanceUseCases.trackPerformanceTrendsUseCase);
  container.bind('getPlayerPerformanceHistoryUseCase').toConstantValue(mockPerformanceUseCases.getPlayerPerformanceHistoryUseCase);
  container.bind('getPerformanceSummaryUseCase').toConstantValue(mockPerformanceUseCases.getPerformanceSummaryUseCase);
  container.bind('recordPerformanceEntryUseCase').toConstantValue(mockPerformanceUseCases.recordPerformanceEntryUseCase);
  
  // Bind mock preference use cases
  container.bind('getUserPreferencesUseCase').toConstantValue(mockPreferenceUseCases.getUserPreferencesUseCase);
  container.bind('updateUserPreferencesUseCase').toConstantValue(mockPreferenceUseCases.updateUserPreferencesUseCase);
  container.bind('resetPreferencesUseCase').toConstantValue(mockPreferenceUseCases.resetPreferencesUseCase);
  
  return container;
}; 