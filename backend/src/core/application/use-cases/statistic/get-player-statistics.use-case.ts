import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Statistic } from '../../../domain/statistic/statistic.entity';
import { IStatisticRepository } from '../../interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { injectable, inject } from 'inversify';

// Input validation schema
const GetPlayerStatisticsInputSchema = z.object({
  playerId: z.string().uuid({
    message: 'Invalid player ID format',
  }),
  dateRange: z
    .object({
      startDate: z.string().or(z.date()).optional(),
      endDate: z.string().or(z.date()).optional(),
    })
    .optional(),
});

// Input type
export type GetPlayerStatisticsInput = z.infer<typeof GetPlayerStatisticsInputSchema>;

// Output type
export interface GetPlayerStatisticsOutput {
  statistic: Statistic;
}

/**
 * Use case for getting player statistics
 */
@injectable()
export class GetPlayerStatisticsUseCase extends BaseUseCase<
  GetPlayerStatisticsInput,
  GetPlayerStatisticsOutput
> {
  constructor(
    @inject('StatisticRepository') private readonly statisticRepository: IStatisticRepository,
    @inject('PlayerRepository') private readonly playerRepository: IPlayerRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: GetPlayerStatisticsInput,
  ): Promise<Result<GetPlayerStatisticsOutput>> {
    try {
      // Validate input
      let validatedData: GetPlayerStatisticsInput;
      try {
        validatedData = await GetPlayerStatisticsInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<GetPlayerStatisticsOutput>(
            new Error(validationError.errors[0].message),
          );
        }
        throw validationError;
      }

      // Check if player exists
      const player = await this.playerRepository.findById(validatedData.playerId);
      if (!player) {
        return Result.fail<GetPlayerStatisticsOutput>(new Error('Player not found'));
      }

      // Retrieve player statistics
      const statistic = await this.statisticRepository.findByPlayerId(validatedData.playerId);

      if (!statistic) {
        return Result.fail<GetPlayerStatisticsOutput>(
          new Error('Statistics not found for this player'),
        );
      }

      // If date range is provided, we could apply filtering here
      // For now, we're just returning the full statistics

      return Result.ok<GetPlayerStatisticsOutput>({ statistic });
    } catch (error) {
      return Result.fail<GetPlayerStatisticsOutput>(
        error instanceof Error ? error : new Error('Failed to get player statistics'),
      );
    }
  }
}
