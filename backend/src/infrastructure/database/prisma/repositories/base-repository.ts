import { PrismaClient } from '@prisma/client';
import { Result } from '../../../../shared/result';

export abstract class BaseRepository {
  protected prisma: PrismaClient;

  /**
   * Execute a database operation safely and return a Result
   * @param operation The database operation to execute
   * @returns Result object with the operation result or error
   */
  protected async executeOperation<T>(operation: () => Promise<T | Result<T>>): Promise<Result<T>> {
    try {
      const result = await operation();

      // If the operation already returns a Result, return it directly
      if (result instanceof Result) {
        return result;
      }

      return Result.ok(result);
    } catch (error) {
      const errorMessage = this.extractErrorMessage(error);
      return Result.fail<T>(errorMessage);
    }
  }

  /**
   * Extract a readable error message from different error types
   */
  private extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      // Handle Prisma specific errors with more detail if needed
      if ('code' in error && 'meta' in error) {
        // This is likely a PrismaClientKnownRequestError
        const code = (error as any).code;
        const meta = (error as any).meta;

        switch (code) {
          case 'P2002':
            return `Unique constraint violation: ${JSON.stringify(meta?.target || [])}`;
          case 'P2003':
            return `Foreign key constraint violation: ${meta?.field_name || ''}`;
          case 'P2025':
            return `Record not found`;
          default:
            return `Database error: ${code} - ${error.message}`;
        }
      }

      return error.message;
    }

    return 'Unknown error occurred';
  }
}
