import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Tournament } from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';

// Schema for validation of tournament details input
const getTournamentDetailsSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
  includeParticipants: z.boolean().optional().default(false)
});

// Input type inferred from the schema
export type GetTournamentDetailsInput = z.infer<typeof getTournamentDetailsSchema>;

// Output DTO for tournament details
export interface GetTournamentDetailsOutput {
  tournament: Tournament;
  participantCount?: number;
  participants?: string[];
}

/**
 * Use case for getting detailed information about a specific tournament
 */
export class GetTournamentDetailsUseCase extends BaseUseCase<
  GetTournamentDetailsInput,
  GetTournamentDetailsOutput
> {
  constructor(private readonly tournamentRepository: ITournamentRepository) {
    super();
  }

  protected async executeImpl(
    input: GetTournamentDetailsInput
  ): Promise<Result<GetTournamentDetailsOutput>> {
    try {
      // Validate input
      const validationResult = getTournamentDetailsSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(
          new Error(`Invalid input: ${validationResult.error.message}`)
        );
      }

      const { tournamentId, includeParticipants } = validationResult.data;

      // Find the tournament
      const tournament = await this.tournamentRepository.findById(tournamentId);
      
      // Check if tournament exists
      if (!tournament) {
        return Result.fail(
          new Error(`Tournament with ID ${tournamentId} not found`)
        );
      }

      // Prepare response
      const response: GetTournamentDetailsOutput = {
        tournament
      };

      // If includeParticipants flag is set, include participant info
      if (includeParticipants) {
        // Get participant count
        response.participantCount = await this.tournamentRepository.countParticipants(tournamentId);
        
        // Get a list of participant IDs (limited to 10 for performance)
        response.participants = await this.tournamentRepository.getParticipants(tournamentId, {
          skip: 0,
          limit: 10
        });
      }

      return Result.ok(response);
    } catch (error) {
      return Result.fail(
        error instanceof Error 
          ? error 
          : new Error('Failed to get tournament details')
      );
    }
  }
} 