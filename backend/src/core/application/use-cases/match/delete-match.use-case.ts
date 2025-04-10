import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { MatchStatus } from '../../../domain/match/match.entity';
import { TournamentStatus } from '../../../domain/tournament/tournament.entity';

// Input validation schema for delete match
const deleteMatchSchema = z.object({
  matchId: z.string().uuid({
    message: 'Invalid match ID format',
  }),
  userId: z.string().uuid({
    message: 'Invalid user ID format',
  }),
});

// Input type inferred from schema
export type DeleteMatchInput = z.infer<typeof deleteMatchSchema>;

/**
 * Use case for deleting a match
 */
export class DeleteMatchUseCase extends BaseUseCase<DeleteMatchInput, void> {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly tournamentRepository: ITournamentRepository,
  ) {
    super();
  }

  protected async executeImpl(input: DeleteMatchInput): Promise<Result<void>> {
    try {
      // Validate input
      const validationResult = deleteMatchSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(new Error(`Invalid input: ${validationResult.error.errors[0].message}`));
      }

      const { matchId, userId } = validationResult.data;

      // Check if match exists
      const match = await this.matchRepository.findById(matchId);
      if (!match) {
        return Result.fail(new Error('Match not found'));
      }

      // Get the tournament to check permissions
      const tournament = await this.tournamentRepository.findById(match.tournamentId);
      if (!tournament) {
        return Result.fail(new Error('Tournament not found'));
      }

      // Check if user has permission (admin or tournament creator)
      if (tournament.createdById !== userId) {
        return Result.fail(
          new Error('Permission denied: only tournament creator can delete matches'),
        );
      }

      // Check if match can be deleted based on its status
      if (match.status !== MatchStatus.PENDING && match.status !== MatchStatus.SCHEDULED) {
        return Result.fail(
          new Error(
            `Cannot delete match in ${match.status} status. Only PENDING or SCHEDULED matches can be deleted`,
          ),
        );
      }

      // Check if tournament status allows match deletion
      if (
        tournament.status !== TournamentStatus.DRAFT
      ) {
        return Result.fail(
          new Error(
            `Cannot delete match in tournament with ${tournament.status} status. Tournament must be in DRAFT status`,
          ),
        );
      }

      // Delete the match
      const deleted = await this.matchRepository.delete(matchId);
      if (!deleted) {
        return Result.fail(new Error('Failed to delete the match'));
      }

      return Result.ok(undefined);
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to delete match'));
    }
  }
}
