import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import {
  IPerformanceHistoryRepository,
  PerformanceTrend,
} from '../../interfaces/repositories/performance-history.repository';
import { z } from 'zod';

// Input validation schema
export const trackPerformanceTrendsSchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  timeframe: z.enum(['monthly', 'yearly', 'all']).default('monthly'),
});

// Input type derived from schema
export type TrackPerformanceTrendsInput = z.infer<typeof trackPerformanceTrendsSchema>;

/**
 * Use case for tracking performance trends over time
 */
export class TrackPerformanceTrendsUseCase extends BaseUseCase<
  TrackPerformanceTrendsInput,
  PerformanceTrend[]
> {
  constructor(private readonly performanceHistoryRepository: IPerformanceHistoryRepository) {
    super();
  }

  /**
   * Execute the use case
   * @param input Trend tracking criteria
   * @returns Result with performance trends data or an error
   */
  protected async executeImpl(
    input: TrackPerformanceTrendsInput,
  ): Promise<Result<PerformanceTrend[]>> {
    try {
      // Validate input
      const validationResult = trackPerformanceTrendsSchema.safeParse(input);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input data';
        return Result.fail<PerformanceTrend[]>(new Error(errorMessage));
      }

      // Parse the validated input
      const validInput = validationResult.data;

      // Fetch performance trends from repository
      const trends = await this.performanceHistoryRepository.findPerformanceTrends(
        validInput.userId,
        validInput.timeframe,
      );

      return Result.ok<PerformanceTrend[]>(trends);
    } catch (error) {
      return Result.fail<PerformanceTrend[]>(
        error instanceof Error ? error : new Error('Failed to track performance trends'),
      );
    }
  }
}
