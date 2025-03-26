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
      console.log('=== Start Tournament Use Case ===');
      console.log('Input:', JSON.stringify(input, null, 2));

      // Validate input
      const validationResult = startTournamentSchema.safeParse(input);
      if (!validationResult.success) {
        const error = new Error(`Invalid input: ${validationResult.error.message}`);
        console.error('Input validation failed:', error.message);
        return Result.fail(error);
      }

      const { tournamentId, userId } = validationResult.data;
      console.log('Validated input:', { tournamentId, userId });

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        const error = new Error(`Tournament with ID ${tournamentId} not found`);
        console.error('Tournament not found:', error.message);
        return Result.fail(error);
      }

      console.log('Found tournament:', {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        createdById: tournament.createdById,
        format: tournament.format,
        maxParticipants: tournament.maxParticipants,
        registrationDeadline: tournament.registrationDeadline
      });

      // Check if tournament is in the correct state to be started
      if (tournament.status !== TournamentStatus.OPEN) {
        const error = new Error(
          `Only tournaments in OPEN state can be started. Current state: ${tournament.status}`,
        );
        console.error('Invalid tournament state:', error.message);
        return Result.fail(error);
      }

      // Check if user has permission to start the tournament
      const user = await this.userRepository.findById(userId);
      if (!user) {
        const error = new Error(`User with ID ${userId} not found`);
        console.error('User not found:', error.message);
        return Result.fail(error);
      }

      console.log('Found user:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isAdmin: user.hasRole(UserRole.ADMIN)
      });

      // Only admin or creator can start the tournament
      const isAdmin = user.hasRole(UserRole.ADMIN);
      const isCreator = tournament.createdById === userId;

      if (!isAdmin && !isCreator) {
        const error = new Error('Only admins or the tournament creator can start a tournament');
        console.error('Permission denied:', error.message);
        return Result.fail(error);
      }

      // Check if tournament has minimum required participants
      const participantCount = await this.tournamentRepository.countParticipants(tournamentId);
      console.log('Participant check:', {
        tournamentId,
        participantCount,
        requiredCount: 2
      });

      if (participantCount < 2) {
        const error = new Error('Tournament needs at least 2 participants to start');
        console.error('Insufficient participants:', error.message);
        return Result.fail(error);
      }

      // Update tournament status to ACTIVE
      try {
        console.log('Attempting to start tournament...');
        tournament.startTournament();
        console.log('Tournament status updated:', {
          tournamentId,
          newStatus: tournament.status,
          updatedAt: tournament.updatedAt
        });
      } catch (error) {
        console.error('Failed to start tournament:', error);
        return Result.fail(error instanceof Error ? error : new Error('Failed to start tournament'));
      }

      // Save the updated tournament
      try {
        console.log('Saving tournament to repository...');
        await this.tournamentRepository.update(tournament);
        console.log('Tournament saved successfully');
      } catch (error) {
        console.error('Failed to save tournament:', error);
        return Result.fail(error instanceof Error ? error : new Error('Failed to save tournament'));
      }

      // Generate the tournament bracket
      const bracketInput: GenerateTournamentBracketInput = {
        tournamentId,
        userId,
      };

      console.log('Generating tournament bracket:', bracketInput);
      const bracketResult = await this.generateTournamentBracketUseCase.execute(bracketInput);

      if (bracketResult.isFailure()) {
        console.error('Bracket generation failed:', bracketResult.getError());
        // Revert tournament status if bracket generation fails
        console.log('Reverting tournament status...');
        tournament.status = TournamentStatus.OPEN;
        tournament.updatedAt = new Date();
        await this.tournamentRepository.update(tournament);
        return Result.fail(new Error(`Tournament started but bracket generation failed: ${bracketResult.getError().message}`));
      }

      const bracketOutput = bracketResult.getValue();
      console.log('Bracket generated successfully:', {
        tournamentId: tournament.id,
        matchesCreated: bracketOutput.matchesCreated,
      });

      return Result.ok({
        tournament,
        message: `Tournament started successfully with ${bracketOutput.matchesCreated} matches created`,
      });
    } catch (error) {
      console.error('=== Start Tournament Use Case Failed ===');
      console.error('Unexpected error:', error);
      return Result.fail(error instanceof Error ? error : new Error('Failed to start tournament'));
    }
  }
}
