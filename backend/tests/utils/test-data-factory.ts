import { PrismaClient, UserRole, PlayerLevel, TournamentFormat, TournamentStatus, MatchStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { getPrismaClient } from './db-test-utils';

// Ensure we're in test environment
if (process.env.NODE_ENV !== 'test') {
  console.warn('Warning: TestDataFactory should only be used in test environment');
  process.env.NODE_ENV = 'test';
}

// Verify test database URL is set properly
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Verify we're using test database credentials
if (!process.env.DATABASE_URL.includes('ligenia_user_test')) {
  console.error('Error: DATABASE_URL does not contain test database user');
  console.error('Make sure to load environment from .env.test');
  process.exit(1);
}

/**
 * Factory to create test data for repository tests
 * This is designed to make creating test data consistent across all test files
 */
export class TestDataFactory {
  private readonly prisma: PrismaClient;
  private readonly prefix: string;

  constructor(prismaInput?: PrismaClient, prefix: string = 'test') {
    // If a prisma instance is provided, use it; otherwise, get the one from db-test-utils
    this.prisma = prismaInput || getPrismaClient();
    this.prefix = prefix;
    
    // Log the database URL being used (partially masked for security)
    const dbUrlMasked = process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@') : 
      'No DATABASE_URL set';
    console.log('TestDataFactory using environment DATABASE_URL:', dbUrlMasked);
  }

  /**
   * Create a test user
   */
  async createUser(customData: Record<string, any> = {}) {
    const timestamp = Date.now();
    const userData = {
      id: customData.id || uuidv4(),
      email: customData.email || `${this.prefix}-user-${timestamp}@example.com`,
      password: customData.password || 'password123',
      name: customData.name || `${this.prefix} User ${timestamp}`,
      role: customData.role || UserRole.PLAYER,
      emailVerified: customData.emailVerified !== undefined ? customData.emailVerified : false,
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    return await this.prisma.user.create({
      data: userData
    });
  }

  /**
   * Create a test player
   */
  async createPlayer(userId: string, customData: Record<string, any> = {}) {
    const playerData = {
      id: customData.id || uuidv4(),
      userId,
      level: customData.level || PlayerLevel.P3,
      age: customData.age || 30,
      country: customData.country || 'Test Country',
      avatar_url: customData.avatar_url || 'https://example.com/avatar.jpg',
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    return await this.prisma.player.create({
      data: playerData
    });
  }

  /**
   * Create a test tournament
   */
  async createTournament(customData: Record<string, any> = {}) {
    const now = new Date();
    const tournamentData = {
      id: customData.id || uuidv4(),
      name: customData.name || `${this.prefix} Tournament ${Date.now()}`,
      description: customData.description || 'Test Tournament Description',
      startDate: customData.startDate || new Date(now.getTime() + 86400000), // tomorrow
      endDate: customData.endDate || new Date(now.getTime() + 86400000 * 7), // a week from now
      registrationEndDate: customData.registrationEndDate || new Date(now.getTime() + 86400000 * 2), // 2 days from now
      location: customData.location || 'Test Location',
      format: customData.format || TournamentFormat.SINGLE_ELIMINATION,
      category: customData.category || PlayerLevel.P3,
      status: customData.status || TournamentStatus.DRAFT,
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    return await this.prisma.tournament.create({
      data: tournamentData
    });
  }

  /**
   * Create a test match
   */
  async createMatch(
    tournamentId: string,
    homePlayerOneId: string,
    homePlayerTwoId: string,
    awayPlayerOneId: string,
    awayPlayerTwoId: string,
    customData: Record<string, any> = {}
  ) {
    const matchData = {
      id: customData.id || uuidv4(),
      tournamentId,
      homePlayerOneId,
      homePlayerTwoId,
      awayPlayerOneId,
      awayPlayerTwoId,
      round: customData.round || 1,
      date: customData.date || new Date(),
      location: customData.location || 'Test Court',
      status: customData.status || MatchStatus.PENDING,
      homeScore: customData.homeScore !== undefined ? customData.homeScore : null,
      awayScore: customData.awayScore !== undefined ? customData.awayScore : null,
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    return await this.prisma.match.create({
      data: matchData
    });
  }

  /**
   * Create test ranking
   */
  async createRanking(playerId: string, playerLevel: PlayerLevel, customData: Record<string, any> = {}) {
    const rankingData = {
      id: customData.id || `ranking-${playerId}`,
      playerId,
      playerLevel,
      rankingPoints: customData.rankingPoints !== undefined ? customData.rankingPoints : 300,
      globalPosition: customData.globalPosition !== undefined ? customData.globalPosition : 1,
      categoryPosition: customData.categoryPosition !== undefined ? customData.categoryPosition : 1,
      positionChange: customData.positionChange !== undefined ? customData.positionChange : 0,
      previousPosition: customData.previousPosition !== undefined ? customData.previousPosition : null,
      lastCalculated: customData.lastCalculated || new Date(),
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    // Instead of using prisma.ranking.create, just return the mock data
    // since there's no Ranking model in the Prisma schema
    console.log('Creating mock ranking:', rankingData.id);
    return rankingData;
  }

  /**
   * Create test statistics
   */
  async createStatistic(userId: string, tournamentId: string, customData: Record<string, any> = {}) {
    const statisticData = {
      id: customData.id || uuidv4(),
      userId,
      tournamentId,
      matchesPlayed: customData.matchesPlayed !== undefined ? customData.matchesPlayed : 5,
      wins: customData.wins !== undefined ? customData.wins : 3,
      losses: customData.losses !== undefined ? customData.losses : 2,
      points: customData.points !== undefined ? customData.points : 50,
      rank: customData.rank !== undefined ? customData.rank : 1,
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    return await this.prisma.statistic.create({
      data: statisticData
    });
  }

  /**
   * Create test performance history
   */
  async createPerformanceHistory(userId: string, customData: Record<string, any> = {}) {
    const now = new Date();
    const performanceData = {
      id: customData.id || uuidv4(),
      userId,
      year: customData.year !== undefined ? customData.year : now.getFullYear(),
      month: customData.month !== undefined ? customData.month : now.getMonth() + 1,
      matchesPlayed: customData.matchesPlayed !== undefined ? customData.matchesPlayed : 10,
      wins: customData.wins !== undefined ? customData.wins : 5,
      losses: customData.losses !== undefined ? customData.losses : 5,
      points: customData.points !== undefined ? customData.points : 100,
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    return await this.prisma.performanceHistory.create({
      data: performanceData
    });
  }

  /**
   * Create test user preference
   */
  async createPreference(userId: string, customData: Record<string, any> = {}) {
    const preferenceData = {
      id: customData.id || uuidv4(),
      userId,
      theme: customData.theme || 'light',
      fontSize: customData.fontSize !== undefined ? customData.fontSize : 16,
      createdAt: customData.createdAt || new Date(),
      updatedAt: customData.updatedAt || new Date(),
    };

    return await this.prisma.userPreference.create({
      data: preferenceData
    });
  }

  /**
   * Create linked test user and player
   */
  async createUserWithPlayer(customUserData: Record<string, any> = {}, customPlayerData: Record<string, any> = {}) {
    const user = await this.createUser(customUserData);
    const player = await this.createPlayer(user.id, customPlayerData);
    
    return { user, player };
  }

  /**
   * Create a set of test users for multiple tests
   */
  async createTestUsers(count: number = 3) {
    const users = [];
    
    for (let i = 0; i < count; i++) {
      users.push(await this.createUser({
        email: `${this.prefix}-user-${i}@example.com`,
        name: `${this.prefix} User ${i}`
      }));
    }
    
    return users;
  }
} 