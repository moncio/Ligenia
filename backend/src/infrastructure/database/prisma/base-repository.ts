import { PrismaClient } from '@prisma/client';
import { Result } from '../../../shared/result';

/**
 * Base class for all Prisma repositories
 * Provides access to the Prisma client and error handling utilities
 */
export abstract class BaseRepository {
  protected prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Converts a Prisma error to a domain error
   * @param error Original error from Prisma
   * @returns Domain error with appropriate message
   */
  protected handleError(error: any): Error {
    // Handle common Prisma errors and convert them to domain-friendly errors
    if (error.code === 'P2025') {
      return new Error(`Resource not found: ${error.meta?.cause || 'Unknown cause'}`);
    }

    if (error.code === 'P2002') {
      const target = error.meta?.target;
      return new Error(`Duplicate entry for ${target ? target.join(', ') : 'unknown field'}`);
    }

    if (error.code === 'P2003') {
      return new Error(
        `Foreign key constraint failed: ${error.meta?.field_name || 'Unknown field'}`,
      );
    }

    // General error handling
    console.error(`Database error: ${error.message}`, error);
    return new Error(`Database operation failed: ${error.message}`);
  }

  /**
   * Executes a database operation and wraps the result in a Result object
   * @param operation Function that performs the database operation
   * @returns Result object with the operation result or error
   */
  protected async executeOperation<T>(operation: () => Promise<T>): Promise<Result<T>> {
    try {
      const result = await operation();
      return Result.ok(result);
    } catch (error) {
      return Result.fail(this.handleError(error));
    }
  }
}
