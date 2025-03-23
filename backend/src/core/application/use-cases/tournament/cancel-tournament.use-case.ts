import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Tournament, TournamentStatus } from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { UserRole } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';

// Schema for validation of cancel tournament input
const cancelTournamentSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
});

// Input type inferred from the schema
export type CancelTournamentInput = z.infer<typeof cancelTournamentSchema>;

// Output DTO for tournament cancellation
export interface CancelTournamentOutput {
  tournament: Tournament;
  message: string;
}

/**
 * Use case for cancelling a tournament
 * Only admins or the tournament organizer can cancel a tournament
 * Tournament must be in DRAFT or OPEN state to be cancelled
 */
export class CancelTournamentUseCase extends BaseUseCase<
  CancelTournamentInput,
  CancelTournamentOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: CancelTournamentInput,
  ): Promise<Result<CancelTournamentOutput>> {
    try {
      // Validate input
      const validationResult = cancelTournamentSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(new Error(`Invalid input: ${validationResult.error.message}`));
      }

      const { tournamentId, userId } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(new Error(`Tournament with ID ${tournamentId} not found`));
      }

      // Check if tournament is in a state that can be cancelled
      if (tournament.status === TournamentStatus.ACTIVE) {
        return Result.fail(new Error('Cannot cancel an active tournament'));
      }

      if (tournament.status === TournamentStatus.COMPLETED) {
        return Result.fail(new Error('Cannot cancel a completed tournament'));
      }

      if (tournament.status === TournamentStatus.CANCELLED) {
        return Result.fail(new Error('Tournament is already cancelled'));
      }

      // Check if user has permission to cancel the tournament
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return Result.fail(new Error(`User with ID ${userId} not found`));
      }

      // Only admin or organizer can cancel the tournament
      const isAdmin = user.hasRole(UserRole.ADMIN);
      const isOrganizer = tournament.createdById === userId;

      if (!isAdmin && !isOrganizer) {
        return Result.fail(
          new Error('Only admins or the tournament organizer can cancel a tournament'),
        );
      }

      // Update tournament status to CANCELLED
      tournament.status = TournamentStatus.CANCELLED;
      tournament.updatedAt = new Date();

      // Save the updated tournament
      await this.tournamentRepository.update(tournament);

      // Return success result
      return Result.ok({
        tournament,
        message: 'Tournament cancelled successfully',
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to cancel tournament'));
    }
  }
}
