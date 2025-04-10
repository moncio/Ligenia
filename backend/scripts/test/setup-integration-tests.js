#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

/**
 * This script prepares the environment for integration tests:
 * 1. Checks required environment variables
 * 2. Verifies database connection
 * 3. Resets the test database
 * 4. Creates necessary roles and policies in Supabase for testing
 */

// Load environment variables from .env.test
const envPath = path.resolve(__dirname, '../.env.test');
if (!fs.existsSync(envPath)) {
  console.error('❌ The .env.test file does not exist.');
  console.error('Please create the .env.test file based on .env.test.example');
  process.exit(1);
}

dotenv.config({ path: envPath });

// Check required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ The following environment variables are missing in .env.test:');
  missingEnvVars.forEach(key => {
    console.error(`  - ${key}`);
  });
  process.exit(1);
}

console.log('✅ All required environment variables are present');

// Verify database connection
console.log('🔍 Verifying database connection...');
try {
  execSync('npx dotenv -e .env.test -- npx prisma migrate dev --name check-connection --skip-generate', {
    stdio: 'inherit',
  });
  console.log('✅ Database connection verified');
} catch (error) {
  console.error('❌ Failed to connect to the database');
  console.error('Please verify the DATABASE_URL variable in .env.test');
  process.exit(1);
}

// Reset the test database
console.log('🔄 Resetting test database...');

// Setup Supabase roles, policies, etc.
console.log('🔧 Setting up Supabase for tests...');

// Wrapping Supabase connection in an async function
const setupSupabase = async () => {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test the connection
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Supabase connection error: ${error.message}`);
    }
    
    console.log('✅ Supabase connection verified');
    
    // This part would be to create test users, but it's implemented in the tests themselves
    // You would implement additional Supabase setup here if needed
    
    return true;
  } catch (error) {
    console.error('❌ Failed to setup Supabase');
    console.error(error.message);
    console.error('Please verify the SUPABASE_URL and SUPABASE_KEY variables in .env.test');
    process.exit(1);
  }
};

// Execute the async function
setupSupabase().then(() => {
  // Reset test database with Prisma (this will apply migrations)
  console.log('🔄 Applying Prisma migrations to test database...');
  try {
    execSync('npx dotenv -e .env.test -- npx prisma migrate reset --force', {
      stdio: 'inherit',
    });
    console.log('✅ Test database reset and migrations applied');
    console.log('✅ Integration test environment is ready');
    console.log('You can now run: npm run test:integration');
  } catch (error) {
    console.error('❌ Failed to reset test database');
    console.error(error);
    process.exit(1);
  }
}); 