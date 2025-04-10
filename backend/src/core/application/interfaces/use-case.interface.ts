import { Result } from '../../../shared/result';

/**
 * Interface for all use cases
 * @template TInput - Input type for the use case
 * @template TOutput - Output type for the use case
 */
export interface IUseCase<TInput, TOutput> {
  /**
   * Execute the use case
   * @param input Input data for the use case
   * @returns Result with the output or an error
   */
  execute(input: TInput): Promise<Result<TOutput>>;
}

/**
 * Interface for use cases that don't require input
 */
export interface IUseCaseWithoutInput<TOutput> {
  execute(): Promise<Result<TOutput>>;
}
