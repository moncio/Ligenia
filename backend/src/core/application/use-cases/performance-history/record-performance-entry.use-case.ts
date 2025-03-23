import { PerformanceHistory } from '@prisma/client';
import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { IPerformanceHistoryRepository } from '../../interfaces/repositories/performance-history.repository';
import { z } from 'zod';

// Input validation schema
export const recordPerformanceEntrySchema = z.object({
  userId: z.string().uuid({ message: 'Invalid user ID format' }),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12).optional(),
  matchesPlayed: z.number().int().min(0).default(0),
  wins: z.number().int().min(0).default(0),
  losses: z.number().int().min(0).default(0),
  points: z.number().int().min(0).default(0)
});

// Input type derived from the schema
export type RecordPerformanceEntryInput = z.infer<typeof recordPerformanceEntrySchema>;

/**
 * Use case for recording a new performance entry or updating an existing one
 */
export class RecordPerformanceEntryUseCase extends BaseUseCase<RecordPerformanceEntryInput, PerformanceHistory> {
  constructor(
    private readonly performanceHistoryRepository: IPerformanceHistoryRepository
  ) { 
    super();
  }

  /**
   * Execute the use case
   * @param input Performance entry data
   * @returns Result with the created/updated performance entry or an error
   */
  protected async executeImpl(input: RecordPerformanceEntryInput): Promise<Result<PerformanceHistory>> {
    try {
      // Validate input
      const validationResult = recordPerformanceEntrySchema.safeParse(input);
      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input data';
        return Result.fail<PerformanceHistory>(new Error(errorMessage));
      }

      // Find if there's an existing entry for this user/year/month
      const existingEntries = await this.performanceHistoryRepository.findByUserId(input.userId, {
        year: input.year,
        month: input.month
      });
      
      let performanceEntry: PerformanceHistory;

      if (existingEntries.length > 0) {
        // Update existing entry
        const existingEntry = existingEntries[0];
        const updatedData = {
          matchesPlayed: input.matchesPlayed !== undefined ? input.matchesPlayed : existingEntry.matchesPlayed,
          wins: input.wins !== undefined ? input.wins : existingEntry.wins,
          losses: input.losses !== undefined ? input.losses : existingEntry.losses,
          points: input.points !== undefined ? input.points : existingEntry.points
        };
        
        performanceEntry = await this.performanceHistoryRepository.update(existingEntry.id, updatedData);
      } else {
        // Create new entry
        performanceEntry = await this.performanceHistoryRepository.create({
          userId: input.userId,
          year: input.year,
          month: input.month,
          matchesPlayed: input.matchesPlayed || 0,
          wins: input.wins || 0,
          losses: input.losses || 0,
          points: input.points || 0
        });
      }

      return Result.ok<PerformanceHistory>(performanceEntry);
    } catch (error) {
      return Result.fail<PerformanceHistory>(
        error instanceof Error 
          ? error 
          : new Error('Failed to record performance entry')
      );
    }
  }
} 