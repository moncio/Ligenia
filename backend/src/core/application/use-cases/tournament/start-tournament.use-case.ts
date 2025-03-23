import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Tournament, TournamentStatus } from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { UserRole } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import {
  GenerateTournamentBracketUseCase,
  GenerateTournamentBracketInput,
} from './generate-tournament-bracket.use-case';

// Schema for validation of start tournament input
const startTournamentSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
});

// Input type inferred from the schema
export type StartTournamentInput = z.infer<typeof startTournamentSchema>;

// Output DTO for tournament start
export interface StartTournamentOutput {
  tournament: Tournament;
  message: string;
}

/**
 * Use case for starting a tournament
 * Only admins or the tournament creator can start a tournament
 * Tournament must be in OPEN state to be started
 * When a tournament is started, a bracket is automatically generated
 */
export class StartTournamentUseCase extends BaseUseCase<
  StartTournamentInput,
  StartTournamentOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly userRepository: IUserRepository,
    private readonly generateTournamentBracketUseCase: GenerateTournamentBracketUseCase,
  ) {
    super();
  }

  protected async executeImpl(input: StartTournamentInput): Promise<Result<StartTournamentOutput>> {
    try {
      // Validate input
      const validationResult = startTournamentSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(new Error(`Invalid input: ${validationResult.error.message}`));
      }

      const { tournamentId, userId } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(new Error(`Tournament with ID ${tournamentId} not found`));
      }

      // Check if tournament is in the correct state to be started
      if (tournament.status !== TournamentStatus.OPEN) {
        return Result.fail(
          new Error(
            `Only tournaments in OPEN state can be started. Current state: ${tournament.status}`,
          ),
        );
      }

      // Check if user has permission to start the tournament
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return Result.fail(new Error(`User with ID ${userId} not found`));
      }

      // Only admin or creator can start the tournament
      const isAdmin = user.hasRole(UserRole.ADMIN);
      const isCreator = tournament.createdById === userId;

      if (!isAdmin && !isCreator) {
        return Result.fail(
          new Error('Only admins or the tournament creator can start a tournament'),
        );
      }

      // Check if tournament has minimum required participants
      const participantCount = await this.tournamentRepository.countParticipants(tournamentId);
      if (participantCount < 2) {
        return Result.fail(new Error('Tournament needs at least 2 participants to start'));
      }

      // Update tournament status to ACTIVE
      tournament.status = TournamentStatus.ACTIVE;
      tournament.updatedAt = new Date();

      // Save the updated tournament
      await this.tournamentRepository.update(tournament);

      // Generate the tournament bracket
      const bracketInput: GenerateTournamentBracketInput = {
        tournamentId,
        userId,
      };

      const bracketResult = await this.generateTournamentBracketUseCase.execute(bracketInput);

      if (bracketResult.isFailure) {
        // Revert tournament status if bracket generation fails
        tournament.status = TournamentStatus.OPEN;
        await this.tournamentRepository.update(tournament);

        return Result.fail(
          new Error(
            `Tournament started but bracket generation failed: ${bracketResult.getError().message}`,
          ),
        );
      }

      // Return success result with bracket info
      return Result.ok({
        tournament,
        message: `Tournament started successfully with ${bracketResult.getValue().matchesCreated} matches created`,
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to start tournament'));
    }
  }
}
