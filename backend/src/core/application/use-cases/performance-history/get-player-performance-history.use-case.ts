import { PerformanceHistory } from '@prisma/client';
import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import {
  IPerformanceHistoryRepository,
  PerformanceHistoryFilter,
} from '../../interfaces/repositories/performance-history.repository';
import { z } from 'zod';

// Input validation schema
export const getPlayerPerformanceHistorySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  year: z
    .union([
      z.number().int().min(2000).max(2100),
      z
        .string()
        .regex(/^\d{4}$/)
        .transform(val => parseInt(val, 10)),
    ])
    .optional(),
  month: z
    .union([
      z.number().int().min(1).max(12),
      z
        .string()
        .regex(/^([1-9]|1[0-2])$/)
        .transform(val => parseInt(val, 10)),
    ])
    .optional(),
  limit: z
    .union([
      z.number().int().min(1).max(100),
      z
        .string()
        .regex(/^\d+$/)
        .transform(val => parseInt(val, 10)),
    ])
    .optional()
    .default(10),
  offset: z
    .union([
      z.number().int().min(0),
      z
        .string()
        .regex(/^\d+$/)
        .transform(val => parseInt(val, 10)),
    ])
    .optional()
    .default(0),
});

// Input type derived from schema
export type GetPlayerPerformanceHistoryInput = z.infer<typeof getPlayerPerformanceHistorySchema>;

/**
 * Use case for retrieving a player's performance history
 */
export class GetPlayerPerformanceHistoryUseCase extends BaseUseCase<
  GetPlayerPerformanceHistoryInput,
  PerformanceHistory[]
> {
  constructor(private readonly performanceHistoryRepository: IPerformanceHistoryRepository) {
    super();
  }

  /**
   * Execute the use case
   * @param input Retrieval criteria
   * @returns Result with player performance history or an error
   */
  protected async executeImpl(
    input: GetPlayerPerformanceHistoryInput,
  ): Promise<Result<PerformanceHistory[]>> {
    try {
      // Validate input
      const validationResult = getPlayerPerformanceHistorySchema.safeParse(input);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input data';
        return Result.fail<PerformanceHistory[]>(new Error(errorMessage));
      }

      // Parse the validated input
      const validInput = validationResult.data;

      // Build filter from input
      const filter: PerformanceHistoryFilter = {
        year: validInput.year ? Number(validInput.year) : undefined,
        month: validInput.month ? Number(validInput.month) : undefined,
        limit: validInput.limit ? Number(validInput.limit) : undefined,
        offset: validInput.offset ? Number(validInput.offset) : undefined,
      };

      // Fetch performance history from repository
      const performanceHistory = await this.performanceHistoryRepository.findByUserId(
        validInput.userId,
        filter,
      );

      return Result.ok<PerformanceHistory[]>(performanceHistory);
    } catch (error) {
      return Result.fail<PerformanceHistory[]>(
        error instanceof Error ? error : new Error('Failed to get player performance history'),
      );
    }
  }
}
