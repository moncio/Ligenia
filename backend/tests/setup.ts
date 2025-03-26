import { config } from 'dotenv';
import { resolve } from 'path';
import { setupSupabaseMock } from './utils/supabaseMock';
import { getPrismaClient, disconnectPrisma, cleanupAllData } from './utils/db-test-utils';

// Set test environment first
process.env.NODE_ENV = 'test';

// Load test environment variables with absolute path to ensure it works regardless of working directory
const envPath = resolve(__dirname, '../.env.test');
config({ path: envPath });

// Verify test database is being used
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL environment variable is not set in .env.test');
  process.exit(1);
}

// Check that we're using the test database
if (!dbUrl.includes('ligenia_user_test')) {
  // Force override to use test database user
  const testDbUrl = dbUrl.replace('ligenia_user', 'ligenia_user_test')
                          .replace('db_ligenia', 'db_ligenia_test');
  console.warn('WARNING: DATABASE_URL not using test user. Overriding to:', 
               testDbUrl.replace(/:[^:]*@/, ':****@'));
  process.env.DATABASE_URL = testDbUrl;
}

// Get the singleton PrismaClient instance
export const prisma = getPrismaClient();

// Global setup
beforeAll(async () => {
  // Setup Supabase mocks
  setupSupabaseMock();

  // Force Jest to use the correct paths
  jest.mock('@supabase/supabase-js', () => require('./mocks/supabase.mock'));

  // Clean the database at the beginning of the test run
  await cleanupAllData(prisma);
});

// Global teardown
afterAll(async () => {
  // Clean the database at the end of the test run
  await cleanupAllData(prisma);
  
  // Disconnect Prisma
  await disconnectPrisma();
});

// Global configuration for tests
const dotenv = require('dotenv');

// Load environment variables from .env.test if it exists, or .env as fallback
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Set up default timeout for tests
jest.setTimeout(30000); // 30 seconds
