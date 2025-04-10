// Script to execute Prisma migrations in Railway environment
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set the working directory to the root of the project
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);

console.log('Starting database migration process...');

try {
  // Ensure the DATABASE_URL environment variable is set
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  console.log('Running Prisma migrations...');
  
  // Run the prisma migrate deploy command
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('Migrations completed successfully!');

  // Optionally run seed data if this is a new deployment
  if (process.env.RAILWAY_ENVIRONMENT === 'staging' || process.env.SEED_ON_DEPLOY === 'true') {
    console.log('Running seed data...');
    execSync('npx prisma db seed', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('Seed completed successfully!');
  }

  console.log('Database setup completed!');
  process.exit(0);
} catch (error) {
  console.error('Error during database migration:', error.message);
  process.exit(1);
} 