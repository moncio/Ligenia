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
          notificationsEnabled: true
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
    // Add all tournament related mock use cases
    listTournamentsUseCase: {
      execute: jest.fn().mockImplementation(({ page = 1, limit = 10, status, category }) => {
        console.log('[MOCK] listTournamentsUseCase executed with params:', { page, limit, status, category });
        
        // Create mock tournaments
        let mockTournaments = [
          {
            id: 'b3dcef7f-082e-48de-b8f6-9b0e1f1e9699',
            name: 'Test Tournament 1',
            description: 'Description for tournament 1',
            startDate: new Date('2023-07-10').toISOString(),
            endDate: new Date('2023-07-15').toISOString(),
            format: 'SINGLE_ELIMINATION',
            status: 'ACTIVE',
            location: 'Madrid, Spain',
            maxParticipants: 32,
            registrationEndDate: new Date('2023-07-05').toISOString(),
            category: 'P3',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '246db9c9-1ea2-4a5d-9cc7-d5fc94122171',
            name: 'Test Tournament 2',
            description: 'Description for tournament 2',
            startDate: new Date('2023-08-10').toISOString(),
            endDate: new Date('2023-08-15').toISOString(),
            format: 'ROUND_ROBIN',
            status: 'DRAFT',
            location: 'Barcelona, Spain',
            maxParticipants: 16,
            registrationEndDate: new Date('2023-08-05').toISOString(),
            category: 'P2',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        ];
        
        // Apply filters if provided
        if (status !== undefined) {
          mockTournaments = mockTournaments.filter(t => t.status === status);
        }
        
        if (category !== undefined) {
          mockTournaments = mockTournaments.filter(t => t.category === category);
        }
        
        // Pagination
        const totalItems = mockTournaments.length;
        const totalPages = Math.ceil(totalItems / limit);
        
        // Get paginated tournaments
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTournaments = mockTournaments.slice(startIndex, endIndex);
        
        const result = Result.ok({
          tournaments: paginatedTournaments,
          pagination: {
            totalItems,
            itemsPerPage: limit,
            currentPage: page,
            totalPages,
          }
        });
        
        console.log('[MOCK] listTournamentsUseCase returning success result');
        return Promise.resolve(result);
      })
    },
    getTournamentDetailsUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId }) => {
        console.log('[MOCK] getTournamentDetailsUseCase executed with tournamentId:', tournamentId);
        
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] getTournamentDetailsUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        
        const mockTournament = {
          id: tournamentId,
          name: 'Test Tournament',
          description: 'Tournament description',
          startDate: new Date('2023-07-10').toISOString(),
          endDate: new Date('2023-07-15').toISOString(),
          format: 'SINGLE_ELIMINATION',
          status: 'ACTIVE',
          location: 'Madrid, Spain',
          maxParticipants: 32,
          registrationEndDate: new Date('2023-07-05').toISOString(),
          category: 'P3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return Promise.resolve(Result.ok(mockTournament));
      })
    },
    createTournamentUseCase: {
      execute: jest.fn().mockImplementation((data) => {
        console.log('[MOCK] createTournamentUseCase executed with data:', data);
        
        // Basic validation
        if (!data.name || data.name.length < 3) {
          const error = new Error('Invalid tournament data');
          console.log('[MOCK] createTournamentUseCase returning failure result');
          return Promise.resolve(Result.fail(error));
        }
        
        const mockTournament = {
          id: 'new-tournament-id',
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return Promise.resolve(Result.ok(mockTournament));
      })
    },
    updateTournamentUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId, ...data }) => {
        console.log('[MOCK] updateTournamentUseCase executed with params:', { tournamentId, ...data });
        
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] updateTournamentUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        
        const mockTournament = {
          id: tournamentId,
          name: data.name || 'Updated Tournament',
          description: data.description || 'Updated description',
          startDate: data.startDate || new Date('2023-07-10').toISOString(),
          endDate: data.endDate || new Date('2023-07-15').toISOString(),
          format: data.format || 'SINGLE_ELIMINATION',
          status: data.status || 'ACTIVE',
          location: data.location || 'Madrid, Spain',
          maxParticipants: data.maxParticipants || 32,
          registrationEndDate: data.registrationEndDate || new Date('2023-07-05').toISOString(),
          category: data.category || 'P3',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        return Promise.resolve(Result.ok(mockTournament));
      })
    },
    cancelTournamentUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId }) => {
        console.log('[MOCK] cancelTournamentUseCase executed with tournamentId:', tournamentId);
        
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] cancelTournamentUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        
        return Promise.resolve(Result.ok(true));
      })
    },
    registerToTournamentUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId, playerId }) => {
        console.log('[MOCK] registerToTournamentUseCase executed with params:', { tournamentId, playerId });
        
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] registerToTournamentUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        
        if (tournamentId === 'full-tournament-id') {
          const error = new Error('Tournament is full');
          console.log('[MOCK] registerToTournamentUseCase returning failure for full tournament');
          return Promise.resolve(Result.fail(error));
        }
        
        const mockRegistration = {
          id: 'registration-id',
          tournamentId,
          playerId,
          registrationDate: new Date().toISOString(),
          status: 'ACCEPTED',
        };
        
        return Promise.resolve(Result.ok(mockRegistration));
      })
    },
    getTournamentStandingsUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId }) => {
        console.log('[MOCK] getTournamentStandingsUseCase executed with tournamentId:', tournamentId);
        
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] getTournamentStandingsUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        
        const mockStandings = [
          { playerName: 'Player 1', position: 1, points: 100, matchesPlayed: 5, wins: 5, losses: 0 },
          { playerName: 'Player 2', position: 2, points: 80, matchesPlayed: 5, wins: 4, losses: 1 },
          { playerName: 'Player 3', position: 3, points: 60, matchesPlayed: 5, wins: 3, losses: 2 },
        ];
        
        return Promise.resolve(Result.ok({ standings: mockStandings }));
      })
    },
    getTournamentBracketUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId }) => {
        console.log('[MOCK] getTournamentBracketUseCase executed with tournamentId:', tournamentId);
        
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] getTournamentBracketUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        
        const mockBracket = {
          rounds: [
            {
              round: 1,
              matches: [
                { 
                  matchId: 'match1', 
                  homePlayer: 'Player 1', 
                  awayPlayer: 'Player 2',
                  homeScore: 6,
                  awayScore: 4,
                  status: 'COMPLETED',
                  winner: 'Player 1'
                },
                { 
                  matchId: 'match2', 
                  homePlayer: 'Player 3', 
                  awayPlayer: 'Player 4',
                  homeScore: 6,
                  awayScore: 2,
                  status: 'COMPLETED',
                  winner: 'Player 3'
                },
              ]
            },
            {
              round: 2,
              matches: [
                { 
                  matchId: 'match3', 
                  homePlayer: 'Player 1', 
                  awayPlayer: 'Player 3',
                  homeScore: null,
                  awayScore: null,
                  status: 'SCHEDULED',
                  winner: null
                }
              ]
            }
          ]
        };
        
        return Promise.resolve(Result.ok({ bracket: mockBracket }));
      })
    },
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
 * Mock performance use cases for testing
 */
const createMockPerformanceUseCases = () => {
  return {
    getPlayerPerformanceHistoryUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, year, month }) => {
        console.log('[MOCK] getPlayerPerformanceHistoryUseCase executed with params:', { playerId, year, month });
        
        // Validate playerId format
        if (!playerId || typeof playerId !== 'string' || playerId.length !== 36) {
          const error = new Error('Invalid player ID format');
          console.log('[MOCK] getPlayerPerformanceHistoryUseCase returning validation error');
          return Promise.resolve(Result.fail(error));
        }

        // Handle non-existent player
        if (playerId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Player not found');
          console.log('[MOCK] getPlayerPerformanceHistoryUseCase returning not found error');
          return Promise.resolve(Result.fail(error));
        }

        // Return mock performance history
        const result = Result.ok([
          {
            id: '1',
            playerId,
            year: year || 2023,
            month: month || 1,
            matchesPlayed: 15,
            wins: 10,
            losses: 5,
            points: 30,
            createdAt: '2023-01-31T23:59:59Z',
            updatedAt: '2023-01-31T23:59:59Z'
          }
        ]);
        console.log('[MOCK] getPlayerPerformanceHistoryUseCase returning success result');
        return Promise.resolve(result);
      })
    },
    getPerformanceSummaryUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, year }) => {
        console.log('[MOCK] getPerformanceSummaryUseCase executed with params:', { playerId, year });
        
        // Validate playerId format
        if (!playerId || typeof playerId !== 'string' || playerId.length !== 36) {
          const error = new Error('Invalid player ID format');
          console.log('[MOCK] getPerformanceSummaryUseCase returning validation error');
          return Promise.resolve(Result.fail(error));
        }

        // Handle non-existent player
        if (playerId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Player not found');
          console.log('[MOCK] getPerformanceSummaryUseCase returning not found error');
          return Promise.resolve(Result.fail(error));
        }

        // Return mock performance summary
        const result = Result.ok({
          playerId,
          year: year || 2023,
          totalMatches: 30,
          wins: 20,
          losses: 10,
          winRate: 0.67,
          averagePoints: 25
        });
        console.log('[MOCK] getPerformanceSummaryUseCase returning success result');
        return Promise.resolve(result);
      })
    },
    trackPerformanceTrendsUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, timeframe }) => {
        console.log('[MOCK] trackPerformanceTrendsUseCase executed with params:', { playerId, timeframe });
        
        // Validate playerId format
        if (!playerId || typeof playerId !== 'string' || playerId.length !== 36) {
          const error = new Error('Invalid player ID format');
          console.log('[MOCK] trackPerformanceTrendsUseCase returning validation error');
          return Promise.resolve(Result.fail(error));
        }

        // Handle non-existent player
        if (playerId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Player not found');
          console.log('[MOCK] trackPerformanceTrendsUseCase returning not found error');
          return Promise.resolve(Result.fail(error));
        }

        // Validate timeframe
        if (!timeframe || !['week', 'month', 'year'].includes(timeframe)) {
          const error = new Error('Invalid timeframe');
          console.log('[MOCK] trackPerformanceTrendsUseCase returning validation error');
          return Promise.resolve(Result.fail(error));
        }

        // Return mock performance trends
        const result = Result.ok({
          playerId,
          timeframe,
          trends: [
            { date: '2023-01-01', winRate: 0.6, points: 25 },
            { date: '2023-02-01', winRate: 0.7, points: 28 },
            { date: '2023-03-01', winRate: 0.65, points: 26 }
          ]
        });
        console.log('[MOCK] trackPerformanceTrendsUseCase returning success result');
        return Promise.resolve(result);
      })
    },
    recordPerformanceEntryUseCase: {
      execute: jest.fn().mockImplementation(({ playerId, performanceData }) => {
        console.log('[MOCK] recordPerformanceEntryUseCase executed with params:', { playerId, performanceData });
        
        // Validate playerId format
        if (!playerId || typeof playerId !== 'string' || playerId.length !== 36) {
          const error = new Error('Invalid player ID format');
          console.log('[MOCK] recordPerformanceEntryUseCase returning validation error');
          return Promise.resolve(Result.fail(error));
        }

        // Handle non-existent player
        if (playerId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Player not found');
          console.log('[MOCK] recordPerformanceEntryUseCase returning not found error');
          return Promise.resolve(Result.fail(error));
        }

        // Validate performance data
        if (!performanceData || typeof performanceData !== 'object') {
          const error = new Error('Invalid performance data');
          console.log('[MOCK] recordPerformanceEntryUseCase returning validation error');
          return Promise.resolve(Result.fail(error));
        }

        // Validate performance data fields
        if (performanceData.matchesPlayed !== performanceData.wins + performanceData.losses) {
          const error = new Error('Invalid performance data: matches played must equal wins plus losses');
          console.log('[MOCK] recordPerformanceEntryUseCase returning validation error');
          return Promise.resolve(Result.fail(error));
        }

        // Return mock performance entry
        const result = Result.ok({
          id: 'generated-uuid',
          playerId,
          ...performanceData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('[MOCK] recordPerformanceEntryUseCase returning success result');
        return Promise.resolve(result);
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
 * Mock statistic use cases for testing
 */
const createMockStatisticUseCases = () => {
  return {
    getStatisticsUseCase: {
      execute: jest.fn().mockImplementation((params) => {
        console.log('[MOCK] getStatisticsUseCase executed with params:', params);
        const result = Result.ok([
          {
            id: 'test-statistic-id',
            userId: params.userId || 'test-user-id',
            tournamentId: params.tournamentId || 'test-tournament-id',
            matchesPlayed: 10,
            wins: 7,
            losses: 3,
            points: 70,
            rank: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
        console.log('[MOCK] getStatisticsUseCase returning success result:', JSON.stringify(result));
        return Promise.resolve(result);
      })
    },
    getStatisticByIdUseCase: {
      execute: jest.fn().mockImplementation(({ id }) => {
        console.log('[MOCK] getStatisticByIdUseCase executed with id:', id);
        if (id === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Statistic not found');
          console.log('[MOCK] getStatisticByIdUseCase returning failure result for id:', id);
          return Promise.resolve(Result.fail(error));
        }
        const result = Result.ok({
          id,
          userId: 'test-user-id',
          tournamentId: 'test-tournament-id',
          matchesPlayed: 10,
          wins: 7,
          losses: 3,
          points: 70,
          rank: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('[MOCK] getStatisticByIdUseCase returning success result:', JSON.stringify(result));
        return Promise.resolve(result);
      })
    },
    createStatisticUseCase: {
      execute: jest.fn().mockImplementation((data) => {
        console.log('[MOCK] createStatisticUseCase executed with data:', data);
        const result = Result.ok({
          id: 'new-statistic-id',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('[MOCK] createStatisticUseCase returning success result:', JSON.stringify(result));
        return Promise.resolve(result);
      })
    },
    updateStatisticUseCase: {
      execute: jest.fn().mockImplementation(({ id, ...data }) => {
        console.log('[MOCK] updateStatisticUseCase executed with params:', { id, ...data });
        if (id === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Statistic not found');
          console.log('[MOCK] updateStatisticUseCase returning failure result for id:', id);
          return Promise.resolve(Result.fail(error));
        }
        const result = Result.ok({
          id,
          userId: 'test-user-id',
          tournamentId: 'test-tournament-id',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log('[MOCK] updateStatisticUseCase returning success result:', JSON.stringify(result));
        return Promise.resolve(result);
      })
    },
    deleteStatisticUseCase: {
      execute: jest.fn().mockImplementation(({ id }) => {
        console.log('[MOCK] deleteStatisticUseCase executed with id:', id);
        if (id === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Statistic not found');
          console.log('[MOCK] deleteStatisticUseCase returning failure result for id:', id);
          return Promise.resolve(Result.fail(error));
        }
        const result = Result.ok();
        console.log('[MOCK] deleteStatisticUseCase returning success result for id:', id);
        return Promise.resolve(result);
      })
    },
    getStatisticsByUserIdUseCase: {
      execute: jest.fn().mockImplementation(({ userId }) => {
        console.log('[MOCK] getStatisticsByUserIdUseCase executed with userId:', userId);
        if (userId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('User not found');
          console.log('[MOCK] getStatisticsByUserIdUseCase returning failure result for userId:', userId);
          return Promise.resolve(Result.fail(error));
        }
        const result = Result.ok([
          {
            id: 'test-statistic-id',
            userId,
            tournamentId: 'test-tournament-id',
            matchesPlayed: 10,
            wins: 7,
            losses: 3,
            points: 70,
            rank: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
        console.log('[MOCK] getStatisticsByUserIdUseCase returning success result:', JSON.stringify(result));
        return Promise.resolve(result);
      })
    },
    getStatisticsByTournamentIdUseCase: {
      execute: jest.fn().mockImplementation(({ tournamentId }) => {
        console.log('[MOCK] getStatisticsByTournamentIdUseCase executed with tournamentId:', tournamentId);
        if (tournamentId === '00000000-0000-0000-0000-000000000000') {
          const error = new Error('Tournament not found');
          console.log('[MOCK] getStatisticsByTournamentIdUseCase returning failure result for tournamentId:', tournamentId);
          return Promise.resolve(Result.fail(error));
        }
        const result = Result.ok([
          {
            id: 'test-statistic-id',
            userId: 'test-user-id',
            tournamentId,
            matchesPlayed: 10,
            wins: 7,
            losses: 3,
            points: 70,
            rank: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ]);
        console.log('[MOCK] getStatisticsByTournamentIdUseCase returning success result:', JSON.stringify(result));
        return Promise.resolve(result);
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
  const mockStatisticUseCases = createMockStatisticUseCases();
  
  // Bind mock user use cases
  container.bind('getUserByIdUseCase').toConstantValue(mockUserUseCases.getUserByIdUseCase);
  container.bind('listUsersUseCase').toConstantValue(mockUserUseCases.listUsersUseCase);
  container.bind('updateUserUseCase').toConstantValue(mockUserUseCases.updateUserUseCase);
  container.bind('deleteUserUseCase').toConstantValue(mockUserUseCases.deleteUserUseCase);
  container.bind('registerUserUseCase').toConstantValue(mockUserUseCases.registerUserUseCase);
  container.bind('getUserStatisticsUseCase').toConstantValue(mockUserUseCases.getUserStatisticsUseCase);
  container.bind('changePasswordUseCase').toConstantValue(mockUserUseCases.changePasswordUseCase);
  container.bind('getUserPerformanceUseCase').toConstantValue(mockUserUseCases.getUserPerformanceUseCase);
  container.bind('getMatchHistoryUseCase').toConstantValue(mockUserUseCases.getMatchHistoryUseCase);
  
  // Bind mock tournament use cases
  container.bind('listTournamentsUseCase').toConstantValue(mockTournamentUseCases.listTournamentsUseCase);
  container.bind('getTournamentDetailsUseCase').toConstantValue(mockTournamentUseCases.getTournamentDetailsUseCase);
  container.bind('createTournamentUseCase').toConstantValue(mockTournamentUseCases.createTournamentUseCase);
  container.bind('updateTournamentUseCase').toConstantValue(mockTournamentUseCases.updateTournamentUseCase);
  container.bind('cancelTournamentUseCase').toConstantValue(mockTournamentUseCases.cancelTournamentUseCase);
  container.bind('registerToTournamentUseCase').toConstantValue(mockTournamentUseCases.registerToTournamentUseCase);
  container.bind('getTournamentStandingsUseCase').toConstantValue(mockTournamentUseCases.getTournamentStandingsUseCase);
  container.bind('getTournamentBracketUseCase').toConstantValue(mockTournamentUseCases.getTournamentBracketUseCase);
  container.bind('listTournamentMatchesUseCase').toConstantValue(mockTournamentUseCases.listTournamentMatchesUseCase);
  
  // Bind mock performance use cases
  container.bind('GetPlayerPerformanceHistoryUseCase').toConstantValue(mockPerformanceUseCases.getPlayerPerformanceHistoryUseCase);
  container.bind('GetPerformanceSummaryUseCase').toConstantValue(mockPerformanceUseCases.getPerformanceSummaryUseCase);
  container.bind('TrackPerformanceTrendsUseCase').toConstantValue(mockPerformanceUseCases.trackPerformanceTrendsUseCase);
  container.bind('RecordPerformanceEntryUseCase').toConstantValue(mockPerformanceUseCases.recordPerformanceEntryUseCase);
  
  // Bind mock preference use cases
  container.bind('GetUserPreferencesUseCase').toConstantValue(mockPreferenceUseCases.getUserPreferencesUseCase);
  container.bind('UpdateUserPreferencesUseCase').toConstantValue(mockPreferenceUseCases.updateUserPreferencesUseCase);
  container.bind('ResetPreferencesUseCase').toConstantValue(mockPreferenceUseCases.resetPreferencesUseCase);
  
  // Bind mock statistic use cases
  container.bind('getStatisticsUseCase').toConstantValue(mockStatisticUseCases.getStatisticsUseCase);
  container.bind('getStatisticByIdUseCase').toConstantValue(mockStatisticUseCases.getStatisticByIdUseCase);
  container.bind('createStatisticUseCase').toConstantValue(mockStatisticUseCases.createStatisticUseCase);
  container.bind('updateStatisticUseCase').toConstantValue(mockStatisticUseCases.updateStatisticUseCase);
  container.bind('deleteStatisticUseCase').toConstantValue(mockStatisticUseCases.deleteStatisticUseCase);
  container.bind('getStatisticsByUserIdUseCase').toConstantValue(mockStatisticUseCases.getStatisticsByUserIdUseCase);
  container.bind('getStatisticsByTournamentIdUseCase').toConstantValue(mockStatisticUseCases.getStatisticsByTournamentIdUseCase);
  
  return container;
}; 