import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Tournament, TournamentStatus } from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';

// Schema for validation
const unregisterFromTournamentSchema = z.object({
  tournamentId: z.string().uuid(),
  userId: z.string().uuid(),
});

// Input type inferred from the schema
export type UnregisterFromTournamentInput = z.infer<typeof unregisterFromTournamentSchema>;

/**
 * Use case for unregistering from a tournament
 */
export class UnregisterFromTournamentUseCase extends BaseUseCase<
  UnregisterFromTournamentInput,
  void
> {
  constructor(private readonly tournamentRepository: ITournamentRepository) {
    super();
  }

  protected async executeImpl(
    input: UnregisterFromTournamentInput,
  ): Promise<Result<void>> {
    // Validate input
    const validationResult = unregisterFromTournamentSchema.safeParse(input);
    if (!validationResult.success) {
      return Result.fail(
        new Error(`Invalid input: ${validationResult.error.message}`),
      );
    }

    // Check if tournament exists
    const tournament = await this.tournamentRepository.findById(input.tournamentId);
    if (!tournament) {
      return Result.fail(
        new Error(`Tournament with ID ${input.tournamentId} not found`),
      );
    }

    // Check if user is registered for the tournament
    const isRegistered = await this.tournamentRepository.isParticipantRegistered(
      input.tournamentId,
      input.userId,
    );
    if (!isRegistered) {
      return Result.fail(
        new Error(`User with ID ${input.userId} is not registered for tournament ${input.tournamentId}`),
      );
    }

    // Check if tournament status allows unregistration (OPEN or DRAFT only)
    if (tournament.status !== TournamentStatus.OPEN && tournament.status !== TournamentStatus.DRAFT) {
      return Result.fail(
        new Error(`Cannot unregister from tournament with status ${tournament.status}`),
      );
    }

    // Check if tournament has already started
    const now = new Date();
    if (tournament.startDate && tournament.startDate < now) {
      return Result.fail(
        new Error(`Cannot unregister after tournament has started`),
      );
    }

    // Unregister participant
    await this.tournamentRepository.unregisterParticipant(
      input.tournamentId,
      input.userId,
    );

    return Result.ok<void>(null);
  }
} 