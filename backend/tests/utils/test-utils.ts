import { PrismaClient, PlayerLevel, TournamentFormat, TournamentStatus, MatchStatus, UserRole } from '@prisma/client';
import { Result } from '../../src/shared/result';
import { v4 as uuidv4 } from 'uuid';

/**
 * Helper function to create a test database client
 */
export const createTestClient = (): PrismaClient => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_TEST,
      },
    },
  });
};

/**
 * Helper function to check if a Result is successful
 */
export const expectSuccess = <T>(result: Result<T>): T => {
  expect(result.isSuccess()).toBe(true);
  return result.getValue();
};

/**
 * Helper function to check if a Result is failed
 */
export const expectFailure = <T>(result: Result<T>): Error => {
  expect(result.isFailure()).toBe(true);
  return result.getError();
};

/**
 * Helper function to create a mock repository
 */
export const createMockRepository = <T>() => {
  return {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
  };
};

// Type definitions for match creation
interface MatchCreationParams {
  tournamentId: string;
  homePlayerOneId: string;
  homePlayerTwoId: string;
  awayPlayerOneId: string;
  awayPlayerTwoId: string;
  customData?: Record<string, any>;
}

/**
 * Test data creation utilities for integration tests
 */
export const testData = {
  /**
   * Create a test user
   */
  createUser: async (prisma: PrismaClient, customData = {}) => {
    const userData = {
      id: uuidv4(),
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Test User',
      role: UserRole.PLAYER,
      emailVerified: true,
      ...customData
    };

    return await prisma.user.create({
      data: userData
    });
  },

  /**
   * Create a test player
   */
  createPlayer: async (prisma: PrismaClient, userId: string, customData = {}) => {
    const playerData = {
      id: uuidv4(),
      userId,
      level: PlayerLevel.P3,
      age: 30,
      country: 'Test Country',
      avatar_url: 'https://example.com/avatar.jpg',
      ...customData
    };

    return await prisma.player.create({
      data: playerData
    });
  },

  /**
   * Create a test tournament
   */
  createTournament: async (prisma: PrismaClient, customData = {}) => {
    const now = new Date();
    const tournamentData = {
      id: uuidv4(),
      name: `Test Tournament ${Date.now()}`,
      description: 'Test Description',
      startDate: new Date(now.getTime() + 86400000), // tomorrow
      endDate: new Date(now.getTime() + 86400000 * 7), // a week from now
      registrationEndDate: new Date(now.getTime() + 86400000 * 2), // 2 days from now
      location: 'Test Location',
      format: TournamentFormat.SINGLE_ELIMINATION,
      category: PlayerLevel.P3,
      status: TournamentStatus.DRAFT,
      ...customData
    };

    return await prisma.tournament.create({
      data: tournamentData
    });
  },

  /**
   * Create a test match
   */
  createMatch: async (prisma: PrismaClient, params: MatchCreationParams) => {
    const { tournamentId, homePlayerOneId, homePlayerTwoId, awayPlayerOneId, awayPlayerTwoId, customData = {} } = params;
    
    const matchData = {
      id: uuidv4(),
      tournamentId,
      homePlayerOneId,
      homePlayerTwoId,
      awayPlayerOneId,
      awayPlayerTwoId,
      round: 1,
      date: new Date(),
      location: 'Test Location',
      status: MatchStatus.PENDING,
      homeScore: null as number | null,
      awayScore: null as number | null,
      ...customData
    };

    return await prisma.match.create({
      data: matchData
    });
  },

  /**
   * Create user preferences
   */
  createPreference: async (prisma: PrismaClient, userId: string, customData = {}) => {
    // Remove enableNotifications from customData if it exists
    const { enableNotifications, ...safeCustomData } = customData as any;
    
    const preferenceData = {
      id: uuidv4(),
      userId,
      theme: 'light',
      fontSize: 16,
      ...safeCustomData
    };

    return await prisma.userPreference.create({
      data: preferenceData,
      // Only select fields that exist in the database
      select: {
        id: true,
        userId: true, 
        theme: true,
        fontSize: true,
        createdAt: true,
        updatedAt: true
      }
    });
  },

  /**
   * Create performance history
   */
  createPerformanceHistory: async (prisma: PrismaClient, userId: string, customData = {}) => {
    const now = new Date();
    const performanceData = {
      id: uuidv4(),
      userId,
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      matchesPlayed: 10,
      wins: 5,
      losses: 5,
      points: 100,
      ...customData
    };

    return await prisma.performanceHistory.create({
      data: performanceData
    });
  },

  /**
   * Create a statistic
   */
  createStatistic: async (prisma: PrismaClient, userId: string, tournamentId: string, customData = {}) => {
    const statisticData = {
      id: uuidv4(),
      userId,
      tournamentId,
      matchesPlayed: 5,
      wins: 3,
      losses: 2,
      points: 50,
      rank: 1,
      ...customData
    };

    return await prisma.statistic.create({
      data: statisticData
    });
  }
};

/**
 * Test data cleanup utilities for integration tests
 */
export const cleanupData = {
  /**
   * Clean up all test data in proper order
   */
  cleanupAll: async (prisma: PrismaClient) => {
    // Delete in reverse order of dependencies
    await prisma.match.deleteMany();
    await prisma.statistic.deleteMany();
    await prisma.performanceHistory.deleteMany();
    await prisma.userPreference.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.player.deleteMany();
    await prisma.userToken.deleteMany();
    await prisma.user.deleteMany();
  },

  /**
   * Clean up specific entity by ID
   */
  cleanupById: async (prisma: PrismaClient, model: string, id: string) => {
    try {
      await (prisma as any)[model].delete({
        where: { id }
      });
    } catch (error) {
      // Ignore not found errors
      console.log(`Could not delete ${model} with ID ${id}`);
    }
  }
};
