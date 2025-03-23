import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { IRankingRepository } from '../../interfaces/repositories/ranking.repository';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { CalculatePlayerRankingsUseCase } from './calculate-player-rankings.use-case';
import { Match, MatchStatus } from '../../../domain/match/match.entity';

// Input validation schema
const UpdateRankingsAfterMatchInputSchema = z.object({
  matchId: z.string().uuid({
    message: 'Invalid match ID format',
  }),
});

// Input type
export type UpdateRankingsAfterMatchInput = z.infer<typeof UpdateRankingsAfterMatchInputSchema>;

// Output type
export interface UpdateRankingsAfterMatchOutput {
  playersUpdated: string[];
  matchId: string;
}

/**
 * Use case for updating rankings after a match is completed
 * Updates affected players' rankings after a match result is recorded
 */
export class UpdateRankingsAfterMatchUseCase extends BaseUseCase<
  UpdateRankingsAfterMatchInput,
  UpdateRankingsAfterMatchOutput
> {
  constructor(
    private readonly rankingRepository: IRankingRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly calculatePlayerRankingsUseCase: CalculatePlayerRankingsUseCase,
  ) {
    super();
  }

  protected async executeImpl(
    input: UpdateRankingsAfterMatchInput,
  ): Promise<Result<UpdateRankingsAfterMatchOutput>> {
    try {
      // Validate input
      const validatedData = await UpdateRankingsAfterMatchInputSchema.parseAsync(input);

      // Get match details
      const match = await this.matchRepository.findById(validatedData.matchId);

      if (!match) {
        return Result.fail<UpdateRankingsAfterMatchOutput>(new Error('Match not found'));
      }

      // Only update rankings for completed matches
      if (match.status !== MatchStatus.COMPLETED) {
        return Result.fail<UpdateRankingsAfterMatchOutput>(
          new Error('Cannot update rankings for a match that is not completed'),
        );
      }

      // Get all players involved in the match
      const playerIds = this.extractPlayerIdsFromMatch(match);

      // Update rankings for each player
      const playersUpdated: string[] = [];

      for (const playerId of playerIds) {
        const result = await this.calculatePlayerRankingsUseCase.execute({
          playerId,
        });

        if (result.isSuccess) {
          playersUpdated.push(playerId);
        }
      }

      return Result.ok<UpdateRankingsAfterMatchOutput>({
        playersUpdated,
        matchId: validatedData.matchId,
      });
    } catch (error) {
      return Result.fail<UpdateRankingsAfterMatchOutput>(
        error instanceof Error ? error : new Error('Failed to update rankings after match'),
      );
    }
  }

  /**
   * Extract all player IDs from a match
   * @param match Match to extract player IDs from
   */
  private extractPlayerIdsFromMatch(match: Match): string[] {
    const playerIds: string[] = [];

    // Add home players
    if (match.homePlayerOneId) {
      playerIds.push(match.homePlayerOneId);
    }

    if (match.homePlayerTwoId) {
      playerIds.push(match.homePlayerTwoId);
    }

    // Add away players
    if (match.awayPlayerOneId) {
      playerIds.push(match.awayPlayerOneId);
    }

    if (match.awayPlayerTwoId) {
      playerIds.push(match.awayPlayerTwoId);
    }

    // Remove duplicates (in case a player is in both home and away teams)
    return [...new Set(playerIds)];
  }
}
