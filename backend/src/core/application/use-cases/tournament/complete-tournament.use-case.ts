import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Tournament, TournamentStatus } from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { UserRole } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';

// Schema for validation of complete tournament input
const completeTournamentSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' })
});

// Input type inferred from the schema
export type CompleteTournamentInput = z.infer<typeof completeTournamentSchema>;

// Output DTO for tournament completion
export interface CompleteTournamentOutput {
  tournament: Tournament;
  message: string;
}

/**
 * Use case for completing a tournament
 * Only admins or the tournament creator can complete a tournament
 * Tournament must be in ACTIVE state to be completed
 */
export class CompleteTournamentUseCase extends BaseUseCase<
  CompleteTournamentInput,
  CompleteTournamentOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly userRepository: IUserRepository
  ) {
    super();
  }

  protected async executeImpl(
    input: CompleteTournamentInput
  ): Promise<Result<CompleteTournamentOutput>> {
    try {
      // Validate input
      const validationResult = completeTournamentSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(
          new Error(`Invalid input: ${validationResult.error.message}`)
        );
      }

      const { tournamentId, userId } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(
          new Error(`Tournament with ID ${tournamentId} not found`)
        );
      }

      // Check if tournament is in a state that can be completed
      if (tournament.status !== TournamentStatus.ACTIVE) {
        return Result.fail(
          new Error('Only active tournaments can be completed')
        );
      }

      // Check if user has permission to complete the tournament
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return Result.fail(
          new Error(`User with ID ${userId} not found`)
        );
      }

      // Only admin or creator can complete the tournament
      const isAdmin = user.hasRole(UserRole.ADMIN);
      const isCreator = tournament.createdById === userId;

      if (!isAdmin && !isCreator) {
        return Result.fail(
          new Error('Only admins or the tournament creator can complete a tournament')
        );
      }

      // Update tournament status to COMPLETED
      tournament.status = TournamentStatus.COMPLETED;
      tournament.updatedAt = new Date();

      // Save the updated tournament
      await this.tournamentRepository.update(tournament);

      // Return success result
      return Result.ok({
        tournament,
        message: 'Tournament completed successfully'
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error 
          ? error 
          : new Error('Failed to complete tournament')
      );
    }
  }
} 