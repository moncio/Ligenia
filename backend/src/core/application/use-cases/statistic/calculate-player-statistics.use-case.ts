import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Statistic } from '../../../domain/statistic/statistic.entity';
import { IStatisticRepository } from '../../interfaces/repositories/statistic.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { Match, MatchStatus } from '../../../domain/match/match.entity';

// Input validation schema
const CalculatePlayerStatisticsInputSchema = z.object({
  playerId: z.string().uuid({
    message: 'Invalid player ID format',
  }),
});

// Input type
export type CalculatePlayerStatisticsInput = z.infer<typeof CalculatePlayerStatisticsInputSchema>;

// Output type
export interface CalculatePlayerStatisticsOutput {
  statistic: Statistic;
}

/**
 * Use case for calculating player statistics based on their matches
 */
export class CalculatePlayerStatisticsUseCase extends BaseUseCase<
  CalculatePlayerStatisticsInput,
  CalculatePlayerStatisticsOutput
> {
  constructor(
    private readonly statisticRepository: IStatisticRepository,
    private readonly playerRepository: IPlayerRepository,
    private readonly matchRepository: IMatchRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: CalculatePlayerStatisticsInput,
  ): Promise<Result<CalculatePlayerStatisticsOutput>> {
    try {
      // Validate input
      let validatedData: CalculatePlayerStatisticsInput;
      try {
        validatedData = await CalculatePlayerStatisticsInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<CalculatePlayerStatisticsOutput>(
            new Error(validationError.errors[0].message),
          );
        }
        throw validationError;
      }

      // Check if player exists
      const player = await this.playerRepository.findById(validatedData.playerId);
      if (!player) {
        return Result.fail<CalculatePlayerStatisticsOutput>(new Error('Player not found'));
      }

      // Get all completed matches for the player
      const matches = await this.matchRepository.findByPlayerId(validatedData.playerId);
      const completedMatches = matches.filter(match => match.status === MatchStatus.COMPLETED);

      // Retrieve existing statistic or create a new one
      let statistic = await this.statisticRepository.findByPlayerId(validatedData.playerId);

      if (!statistic) {
        // Create new statistic
        statistic = new Statistic(
          `statistic-${Date.now()}`, // Simple unique ID generation for testing
          validatedData.playerId,
        );
      } else {
        // Reset existing statistic to recalculate
        statistic.reset();
      }

      // Calculate statistics from completed matches
      this.calculateStatisticsFromMatches(statistic, completedMatches, validatedData.playerId);

      // Save or update the statistic
      if (await this.statisticRepository.findById(statistic.id)) {
        await this.statisticRepository.update(statistic);
      } else {
        await this.statisticRepository.save(statistic);
      }

      return Result.ok<CalculatePlayerStatisticsOutput>({ statistic });
    } catch (error) {
      return Result.fail<CalculatePlayerStatisticsOutput>(
        error instanceof Error ? error : new Error('Failed to calculate player statistics'),
      );
    }
  }

  /**
   * Calculate statistics from a player's completed matches
   */
  private calculateStatisticsFromMatches(
    statistic: Statistic,
    matches: Match[],
    playerId: string,
  ): void {
    if (matches.length === 0) {
      return;
    }

    // Group tournaments to track participation
    const tournamentIds = new Set<string>();
    const tournamentWins = new Set<string>();

    // Process each match
    for (const match of matches) {
      tournamentIds.add(match.tournamentId);

      // Determine if player was on home or away team
      const isHomeTeam = match.homePlayerOneId === playerId || match.homePlayerTwoId === playerId;
      const isAwayTeam = match.awayPlayerOneId === playerId || match.awayPlayerTwoId === playerId;

      if (!isHomeTeam && !isAwayTeam) {
        continue; // Skip if player not in this match
      }

      // Get player's score and opponent's score
      const playerScore = isHomeTeam ? match.homeScore : match.awayScore;
      const opponentScore = isHomeTeam ? match.awayScore : match.homeScore;

      if (playerScore === null || opponentScore === null) {
        continue; // Skip if scores not recorded
      }

      // Determine if player won
      const playerWon = playerScore > opponentScore;

      // Update match statistics
      statistic.updateAfterMatch(playerWon, playerScore);

      // Track tournament wins (this is a simplification - actual tournament winners
      // would be determined by a separate process)
      if (playerWon) {
        tournamentWins.add(match.tournamentId);
      }
    }

    // Update tournament statistics
    statistic.tournamentsPlayed = tournamentIds.size;
    statistic.tournamentsWon = tournamentWins.size;
  }
}
