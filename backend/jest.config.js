/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.ts'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  coveragePathIgnorePatterns: [
    "node_modules",
    "test-config",
    "interfaces",
    "jestGlobalMocks.ts",
    ".module.ts",
    ".mock.ts",
    "<rootDir>/src/main.ts",
    "<rootDir>/src/app.module.ts",
    "prisma/seed.ts",
    ".dto.ts",
    ".entity.ts"
  ],
  // Configurations to handle database-dependent tests
  testTimeout: 30000,
  verbose: true,
  // Database tests should run in band to prevent race conditions
  // Add --maxWorkers=1 for infrastructure tests
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  },
  // Add configuration to define test groups
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      // Unit tests can run in parallel
      maxWorkers: '50%',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      // Integration tests run serially
      maxWorkers: 1,
    },
    {
      displayName: 'infrastructure',
      testMatch: ['<rootDir>/tests/integration/infrastructure/**/*.test.ts'],
      // Infrastructure tests that touch the database run serially
      maxWorkers: 1,
    }
  ]
}; 