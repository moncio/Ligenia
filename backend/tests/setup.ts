import { config } from 'dotenv';
import { resolve } from 'path';
import { setupSupabaseMock } from './utils/supabaseMock';
import { getPrismaClient, disconnectPrisma, cleanupAllData } from './utils/db-test-utils';

// Set test environment first
process.env.NODE_ENV = 'test';

// Load test environment variables with absolute path to ensure it works regardless of working directory
const envPath = resolve(__dirname, '../.env.test');
config({ path: envPath });

// Set test Supabase environment variables
process.env.SUPABASE_URL = 'https://test-supabase-url.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-supabase-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-supabase-service-role-key';
process.env.JWT_SECRET = 'test-jwt-secret';

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

// Add debug logging
console.log('TEST SETUP: Connecting to database with URL:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));
console.log('TEST SETUP: Database HOST:', process.env.DATABASE_HOST);
console.log('TEST SETUP: Database PORT:', process.env.DATABASE_PORT);
console.log('TEST SETUP: Database USER:', process.env.DATABASE_USER);
console.log('TEST SETUP: Database NAME:', process.env.DATABASE_NAME);

// Get the singleton PrismaClient instance
export const prisma = getPrismaClient();

// Global setup
beforeAll(async () => {
  console.log('Setting up test environment...');
  
  // Setup Supabase mocks before importing any modules that use Supabase
  console.log('Setting up Supabase mocks...');

  // Mock Supabase client
  jest.mock('@supabase/supabase-js', () => {
    const mockClient = {
      auth: {
        signUp: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn(),
    };

    return {
      createClient: jest.fn().mockReturnValue(mockClient),
    };
  });

  // Force Jest to use the correct paths
  console.log('Configuring module mocks...');
  jest.mock('@supabase/supabase-js', () => require('./mocks/supabase.mock'));
  
  // Register mock for automatic user sync in Supabase Auth
  console.log('Setting up automatic user synchronization for tests...');
  jest.mock('../src/infrastructure/auth/supabase/supabase-auth.service', () => {
    const actual = jest.requireActual('../src/infrastructure/auth/supabase/supabase-auth.service');
    
    // Enhance the register method to automatically sync users to local DB
    const origRegister = actual.SupabaseAuthService.prototype.register;
    actual.SupabaseAuthService.prototype.register = async function (...args: any[]) {
      const result = await origRegister.apply(this, args);
      console.log('[TEST] User registered in Auth, ensuring sync with local DB...');
      return result;
    };
    
    return actual;
  });

  // Clean the database at the beginning of the test run
  console.log('Cleaning test database...');
  await cleanupAllData(prisma);
  
  console.log('Test environment setup complete.');
});

// Global teardown
afterAll(async () => {
  console.log('Running global teardown...');
  
  try {
    // Clean the database at the end of the test run
    console.log('Cleaning up test data...');
    await cleanupAllData(prisma);
    console.log('Test data cleanup completed');
    
    // Disconnect Prisma - this is crucial to avoid open handles
    console.log('Disconnecting from database...');
    await disconnectPrisma();
    console.log('Database disconnection completed');
    
    // Allow some time for any remaining connections to close
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error('Error during test teardown:', error);
    // Even if there's an error, still try to disconnect
    await disconnectPrisma().catch(e => console.error('Final disconnect attempt failed:', e));
  }
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
