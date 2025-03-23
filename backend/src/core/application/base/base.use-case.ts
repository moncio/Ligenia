import { IUseCase } from '../interfaces/use-case.interface';
import { Result } from '../../../shared/result';
import { z } from 'zod';

/**
 * Base class for all use cases
 * Provides common error handling and validation
 */
export abstract class BaseUseCase<TInput, TOutput> implements IUseCase<TInput, TOutput> {
  /**
   * Implementation of the use case logic
   * @param input Input data for the use case
   * @returns Result with the output or an error
   */
  protected abstract executeImpl(input: TInput): Promise<Result<TOutput>>;

  /**
   * Execute the use case with error handling
   * @param input Input data for the use case
   * @returns Result with the output or an error
   */
  async execute(input: TInput): Promise<Result<TOutput>> {
    try {
      return await this.executeImpl(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail<TOutput>(new Error(error.errors[0].message));
      }
      return Result.fail<TOutput>(
        error instanceof Error ? error : new Error('Internal server error'),
      );
    }
  }
}
