import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Tournament, TournamentStatus } from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { UserRole } from '../../../domain/user/user.entity';

// Schema for validation
const registerToTournamentSchema = z.object({
  tournamentId: z.string().uuid(),
  userId: z.string().uuid(),
});

// Input type inferred from the schema
export type RegisterToTournamentInput = z.infer<typeof registerToTournamentSchema>;

/**
 * Use case for registering to a tournament
 */
export class RegisterToTournamentUseCase extends BaseUseCase<RegisterToTournamentInput, void> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  protected async executeImpl(input: RegisterToTournamentInput): Promise<Result<void>> {
    // Validate input
    const validationResult = registerToTournamentSchema.safeParse(input);
    if (!validationResult.success) {
      return Result.fail(new Error(`Invalid input: ${validationResult.error.message}`));
    }

    // Check if tournament exists
    const tournament = await this.tournamentRepository.findById(input.tournamentId);
    if (!tournament) {
      return Result.fail(new Error(`Tournament with ID ${input.tournamentId} not found`));
    }

    // Check if user exists
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      return Result.fail(new Error(`User with ID ${input.userId} not found`));
    }

    // Check if user is a player
    if (!user.hasRole(UserRole.PLAYER)) {
      return Result.fail(new Error('Only users with PLAYER role can register to tournaments'));
    }

    // Check if user is already registered
    const isRegistered = await this.tournamentRepository.isParticipantRegistered(
      input.tournamentId,
      input.userId,
    );
    if (isRegistered) {
      return Result.fail(new Error('User is already registered to this tournament'));
    }

    // Check tournament status
    if (tournament.status !== TournamentStatus.ACTIVE) {
      return Result.fail(
        new Error(`Cannot register for tournament with status ${tournament.status}`),
      );
    }

    // Check registration deadline
    if (tournament.registrationDeadline && tournament.registrationDeadline < new Date()) {
      return Result.fail(new Error('Registration deadline has passed'));
    }

    // Check max participants
    if (tournament.maxParticipants) {
      const participantCount = await this.tournamentRepository.countParticipants(
        input.tournamentId,
      );
      if (participantCount >= tournament.maxParticipants) {
        return Result.fail(new Error('Tournament has reached maximum participants'));
      }
    }

    // Register participant
    await this.tournamentRepository.registerParticipant(input.tournamentId, input.userId);

    return Result.ok<void>(null);
  }
}
