import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { IPerformanceHistoryRepository, PerformanceSummary } from '../../interfaces/repositories/performance-history.repository';
import { z } from 'zod';

// Input validation schema
export const getPerformanceSummarySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  year: z.union([
    z.number().int().min(2000).max(2100),
    z.string().regex(/^\d{4}$/).transform(val => parseInt(val, 10))
  ]).optional()
});

// Input type derived from schema
export type GetPerformanceSummaryInput = z.infer<typeof getPerformanceSummarySchema>;

/**
 * Use case for retrieving a performance summary for a player
 */
export class GetPerformanceSummaryUseCase extends BaseUseCase<GetPerformanceSummaryInput, PerformanceSummary> {
  constructor(
    private readonly performanceHistoryRepository: IPerformanceHistoryRepository
  ) {
    super();
  }

  /**
   * Execute the use case
   * @param input Retrieval criteria
   * @returns Result with the performance summary or an error
   */
  protected async executeImpl(input: GetPerformanceSummaryInput): Promise<Result<PerformanceSummary>> {
    try {
      // Validate input
      const validationResult = getPerformanceSummarySchema.safeParse(input);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input data';
        return Result.fail<PerformanceSummary>(new Error(errorMessage));
      }

      // Parse the validated input
      const validInput = validationResult.data;
      
      // Convert year to number if provided
      const year = validInput.year ? Number(validInput.year) : undefined;

      // Fetch performance summary from repository
      const summary = await this.performanceHistoryRepository.findPerformanceSummary(
        validInput.userId,
        year
      );

      return Result.ok<PerformanceSummary>(summary);
    } catch (error) {
      return Result.fail<PerformanceSummary>(
        error instanceof Error 
          ? error 
          : new Error('Failed to get performance summary')
      );
    }
  }
} 