import { PrismaClient } from '@prisma/client';
import { Result } from '../../src/shared/result';

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
  expect(result.isSuccess).toBe(true);
  return result.getValue();
};

/**
 * Helper function to check if a Result is failed
 */
export const expectFailure = <T>(result: Result<T>): Error => {
  expect(result.isFailure).toBe(true);
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