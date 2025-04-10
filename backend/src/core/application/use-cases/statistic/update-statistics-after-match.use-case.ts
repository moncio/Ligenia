import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Statistic } from '../../../domain/statistic/statistic.entity';
import { IStatisticRepository } from '../../interfaces/repositories/statistic.repository';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { Match, MatchStatus } from '../../../domain/match/match.entity';

// Input validation schema
const UpdateStatisticsAfterMatchInputSchema = z.object({
  matchId: z.string().uuid({
    message: 'Invalid match ID format',
  }),
});

// Input type
export type UpdateStatisticsAfterMatchInput = z.infer<typeof UpdateStatisticsAfterMatchInputSchema>;

// Output type
export interface UpdateStatisticsAfterMatchOutput {
  homePlayerOneStatistic: Statistic;
  homePlayerTwoStatistic: Statistic;
  awayPlayerOneStatistic: Statistic;
  awayPlayerTwoStatistic: Statistic;
}

/**
 * Use case for updating player statistics after a match is completed
 */
export class UpdateStatisticsAfterMatchUseCase extends BaseUseCase<
  UpdateStatisticsAfterMatchInput,
  UpdateStatisticsAfterMatchOutput
> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly matchRepository: IMatchRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: UpdateStatisticsAfterMatchInput,
  ): Promise<Result<UpdateStatisticsAfterMatchOutput>> {
    try {
      // Validate input
      let validatedData: UpdateStatisticsAfterMatchInput;
      try {
        validatedData = await UpdateStatisticsAfterMatchInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<UpdateStatisticsAfterMatchOutput>(
            new Error(validationError.errors[0].message),
          );
        }
        throw validationError;
      }

      // Find match
      const match = await this.matchRepository.findById(validatedData.matchId);
      if (!match) {
        return Result.fail<UpdateStatisticsAfterMatchOutput>(new Error('Match not found'));
      }

      // Check if match is completed
      if (match.status !== MatchStatus.COMPLETED) {
        return Result.fail<UpdateStatisticsAfterMatchOutput>(
          new Error('Cannot update statistics for a match that is not completed'),
        );
      }

      // Check if scores are recorded
      if (match.homeScore === null || match.awayScore === null) {
        return Result.fail<UpdateStatisticsAfterMatchOutput>(
          new Error('Match scores not recorded'),
        );
      }

      // Determine winning conditions
      const homeTeamWon = match.homeScore > match.awayScore;
      const awayTeamWon = match.awayScore > match.homeScore;

      // Update home team player statistics
      const homePlayerOneStatistic = await this.updatePlayerStatistic(
        match.homePlayerOneId,
        homeTeamWon,
        match.homeScore,
      );

      const homePlayerTwoStatistic = await this.updatePlayerStatistic(
        match.homePlayerTwoId,
        homeTeamWon,
        match.homeScore,
      );

      // Update away team player statistics
      const awayPlayerOneStatistic = await this.updatePlayerStatistic(
        match.awayPlayerOneId,
        awayTeamWon,
        match.awayScore,
      );

      const awayPlayerTwoStatistic = await this.updatePlayerStatistic(
        match.awayPlayerTwoId,
        awayTeamWon,
        match.awayScore,
      );

      // Return statistics from each team
      return Result.ok<UpdateStatisticsAfterMatchOutput>({
        homePlayerOneStatistic: homePlayerOneStatistic,
        homePlayerTwoStatistic: homePlayerTwoStatistic,
        awayPlayerOneStatistic: awayPlayerOneStatistic,
        awayPlayerTwoStatistic: awayPlayerTwoStatistic,
      });
    } catch (error) {
      return Result.fail<UpdateStatisticsAfterMatchOutput>(
        error instanceof Error ? error : new Error('Failed to update statistics after match'),
      );
    }
  }

  /**
   * Update or create statistics for a player
   */
  private async updatePlayerStatistic(
    playerId: string,
    won: boolean,
    score: number,
  ): Promise<Statistic> {
    // Find existing statistic or create a new one
    let statistic = await this.statisticRepository.findByPlayerId(playerId);

    if (!statistic) {
      // Create new statistic
      statistic = new Statistic(`statistic-${Date.now()}-${playerId.substring(0, 8)}`, playerId);
    }

    // Update statistics
    statistic.updateAfterMatch(won, score);

    // Save or update
    if (await this.statisticRepository.findById(statistic.id)) {
      await this.statisticRepository.update(statistic);
    } else {
      await this.statisticRepository.save(statistic);
    }

    return statistic;
  }
}
