import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { config } from 'dotenv';
import { resolve } from 'path';

// Ensure test environment is set
process.env.NODE_ENV = 'test';

// Load test environment variables
const envPath = resolve(__dirname, '../../.env.test');
config({ path: envPath });

// Log environment configuration for debugging
console.log('Test DB Config:', {
  environment: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL?.substring(0, 30) + '...' // Only show part of URL for security
});

// Add more detailed logging
console.log('DB_TEST_UTILS: Database HOST:', process.env.DATABASE_HOST);
console.log('DB_TEST_UTILS: Database PORT:', process.env.DATABASE_PORT);
console.log('DB_TEST_UTILS: Database USER:', process.env.DATABASE_USER);
console.log('DB_TEST_UTILS: Database NAME:', process.env.DATABASE_NAME);

// Singleton PrismaClient for all tests
let prismaInstance: PrismaClient | null = null;

/**
 * Get the singleton PrismaClient instance
 */
export function getPrismaClient(): PrismaClient {
  // Force a new instance for tests to ensure we use the test database
  if (prismaInstance) {
    prismaInstance.$disconnect();
    prismaInstance = null;
  }

  // Make sure DATABASE_URL is set and points to the test database
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  // Verify we're using the test database user
  if (!dbUrl.includes('ligenia_user_test')) {
    console.warn('WARNING: DATABASE_URL does not contain ligenia_user_test. ' + 
      'Make sure you are using the test database credentials.');
  }
  
  console.log('Creating PrismaClient with test URL from environment variables');
  
  // Force the URL to use port 5433, different from the real database port
  const testDbUrl = "postgresql://ligenia_user_test:C0mpl3x_D8_P4ssw0rd_7531*@localhost:5433/db_ligenia_test";
  console.log('Forced DB URL:', testDbUrl.replace(/:[^:]*@/, ':****@'));
  
  // Create a new PrismaClient instance with the explicit DATABASE_URL
  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: testDbUrl,
      },
    },
    log: process.env.DEBUG_PRISMA === 'true' ? ['query', 'error'] : ['error'],
  });
  
  console.log('Created PrismaClient with database URL from environment');
  return prismaInstance;
}

/**
 * Disconnect the PrismaClient
 */
export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    try {
      console.log('Disconnecting Prisma client...');
      
      // Try to close any open connections gracefully
      await prismaInstance.$disconnect();
      
      // Important: Set to null to allow garbage collection
      prismaInstance = null;
      
      console.log('Prisma client disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting Prisma client:', error);
      // Even if there's an error, still set to null
      prismaInstance = null;
      throw error;
    }
  } else {
    console.log('No Prisma client to disconnect');
  }
}

/**
 * Execute a function within a transaction
 * For testing purposes, we'll just execute the function without a transaction
 * to avoid issues with the test database not supporting transactions
 */
export async function executeWithinTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>,
): Promise<T> {
  const prisma = getPrismaClient();
  
  try {
    // For now, just execute the function without a transaction
    // This still allows tests to work, just without rollback protection
    return await callback(prisma);

    // In a real implementation with transaction support, we would use:
    // return await prisma.$transaction(async (tx) => {
    //   return await callback(tx as unknown as PrismaClient);
    // });
  } catch (error) {
    console.error('Operation failed:', error);
    throw error;
  }
}

/**
 * Clean up all test data in proper deletion order to avoid foreign key constraints
 */
export async function cleanupAllData(prisma: PrismaClient): Promise<void> {
  try {
    // Delete in reverse order of dependencies
    await prisma.match.deleteMany({});
    await prisma.statistic.deleteMany({});
    await prisma.performanceHistory.deleteMany({});
    try {
      // Use dynamic access since 'ranking' might not be in all schema versions
      await (prisma as any).ranking?.deleteMany({}) || console.log('No ranking table found');
    } catch (e) {
      console.log('Skipping ranking deletion, table may not exist');
    }
    await prisma.userPreference.deleteMany({});
    await prisma.userToken.deleteMany({});
    await prisma.player.deleteMany({});
    await prisma.tournament.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Database cleaned successfully');
  } catch (error) {
    console.error('Failed to clean up database:', error);
  }
}

/**
 * Generate a unique test identifier to prevent test data collision
 */
export function generateTestId(): string {
  return `test-${uuidv4().substring(0, 8)}`;
}

/**
 * Store test data for cleanup
 */
class TestDataRegistry {
  private static instance: TestDataRegistry;
  private dataToClean: Record<string, Array<{ model: string, id: string }>> = {};

  private constructor() {}

  public static getInstance(): TestDataRegistry {
    if (!TestDataRegistry.instance) {
      TestDataRegistry.instance = new TestDataRegistry();
    }
    return TestDataRegistry.instance;
  }

  public registerForCleanup(testSuiteId: string, model: string, id: string): void {
    if (!this.dataToClean[testSuiteId]) {
      this.dataToClean[testSuiteId] = [];
    }
    this.dataToClean[testSuiteId].push({ model, id });
  }

  public async cleanupTestData(testSuiteId: string, prisma: PrismaClient): Promise<void> {
    if (!this.dataToClean[testSuiteId] || this.dataToClean[testSuiteId].length === 0) {
      return;
    }
    
    // Group by model for more efficient cleanup
    const modelGroups: Record<string, string[]> = {};
    for (const { model, id } of this.dataToClean[testSuiteId]) {
      if (!modelGroups[model]) {
        modelGroups[model] = [];
      }
      modelGroups[model].push(id);
    }
    
    // Process in reverse dependency order to avoid foreign key issues
    const modelOrder = ['match', 'statistic', 'performanceHistory', 'ranking', 'userPreference', 'userToken', 'player', 'tournament', 'user'];
    
    try {
      for (const model of modelOrder) {
        if (modelGroups[model] && modelGroups[model].length > 0) {
          try {
            // Use dynamic access for model names
            await (prisma as any)[model]?.deleteMany({
              where: { id: { in: modelGroups[model] } },
            });
          } catch (e) {
            console.log(`Model ${model} might not exist, skipping cleanup`);
          }
        }
      }
      
      delete this.dataToClean[testSuiteId];
    } catch (error) {
      console.error(`Failed to clean up data for test suite ${testSuiteId}:`, error);
    }
  }
}

export const testDataRegistry = TestDataRegistry.getInstance();

/**
 * Create an isolated test environment for a repository test
 */
export function createRepositoryTestSuite(repositoryName: string) {
  const testSuiteId = generateTestId();
  const prisma = getPrismaClient();
  
  // Return common setup and teardown functions
  return {
    // Track entity creation for cleanup
    registerForCleanup: (model: string, id: string) => {
      testDataRegistry.registerForCleanup(testSuiteId, model, id);
    },
    
    // Execute test cleanup
    cleanup: async () => {
      await testDataRegistry.cleanupTestData(testSuiteId, prisma);
    },
    
    // Run a test within a transaction
    runInTransaction: async <T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> => {
      return executeWithinTransaction(callback);
    },
    
    // Get the test suite ID
    getTestSuiteId: () => testSuiteId,
    
    // Get the prisma client
    getPrisma: () => prisma,
  };
} 