import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import {
  Tournament,
  TournamentStatus,
  TournamentFormat,
} from '../../../domain/tournament/tournament.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';

// Schema for validation of generate bracket input
const generateTournamentBracketSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
  userId: z.string().uuid({ message: 'User ID must be a valid UUID' }),
});

// Input type inferred from the schema
export type GenerateTournamentBracketInput = z.infer<typeof generateTournamentBracketSchema>;

// Output DTO for tournament bracket generation
export interface GenerateTournamentBracketOutput {
  tournamentId: string;
  format: TournamentFormat;
  rounds: number;
  matchesCreated: number;
}

/**
 * Use case for generating the tournament bracket
 * Creates matches for the tournament based on the format and participants
 * Currently only supports SINGLE_ELIMINATION format
 */
export class GenerateTournamentBracketUseCase extends BaseUseCase<
  GenerateTournamentBracketInput,
  GenerateTournamentBracketOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly matchRepository: IMatchRepository,
    private readonly userRepository: IUserRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: GenerateTournamentBracketInput,
  ): Promise<Result<GenerateTournamentBracketOutput>> {
    try {
      // Validate input
      const validationResult = generateTournamentBracketSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(new Error(`Invalid input: ${validationResult.error.message}`));
      }

      const { tournamentId, userId } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(new Error(`Tournament with ID ${tournamentId} not found`));
      }

      // Check if user has permission (admin or creator)
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return Result.fail(new Error(`User with ID ${userId} not found`));
      }

      const isAdmin = user.hasRole(UserRole.ADMIN);
      const isCreator = tournament.createdById === userId;

      if (!isAdmin && !isCreator) {
        return Result.fail(
          new Error('Only admins or the tournament creator can generate tournament brackets'),
        );
      }

      // Check if tournament is in the correct state
      const validStates = [TournamentStatus.DRAFT, TournamentStatus.OPEN];
      if (!validStates.includes(tournament.status)) {
        return Result.fail(
          new Error(
            `Cannot generate bracket for a tournament in ${tournament.status} state. Tournament must be in DRAFT or OPEN state`,
          ),
        );
      }

      // Check if tournament already has matches
      const hasMatches = await this.matchRepository.tournamentHasMatches(tournamentId);
      if (hasMatches) {
        return Result.fail(
          new Error('Tournament already has matches. Cannot generate bracket again'),
        );
      }

      // Check if tournament has enough participants
      const participants = await this.tournamentRepository.getParticipants(tournamentId);
      if (participants.length < 2) {
        return Result.fail(
          new Error('Tournament needs at least 2 participants to generate a bracket'),
        );
      }

      // Generate matches based on the tournament format
      if (tournament.format === TournamentFormat.SINGLE_ELIMINATION) {
        const result = await this.generateSingleEliminationBracket(tournament, participants);
        return Result.ok(result);
      } else {
        return Result.fail(new Error(`Tournament format ${tournament.format} is not supported`));
      }
    } catch (error) {
      return Result.fail(
        error instanceof Error ? error : new Error('Failed to generate tournament bracket'),
      );
    }
  }

  /**
   * Generates a single elimination tournament bracket
   * @param tournament The tournament to generate the bracket for
   * @param participants Array of participant IDs
   */
  private async generateSingleEliminationBracket(
    tournament: Tournament,
    participants: string[],
  ): Promise<GenerateTournamentBracketOutput> {
    // Shuffle participants to randomize the bracket
    const shuffledParticipants = this.shuffleArray([...participants]);

    // Calculate the number of rounds needed
    const totalParticipants = shuffledParticipants.length;
    const rounds = Math.ceil(Math.log2(totalParticipants));

    // Calculate the total number of matches needed
    const totalMatches = totalParticipants - 1;

    // Calculate the number of first-round matches
    const firstRoundMatches = Math.ceil(totalParticipants / 2);
    const byes = Math.pow(2, rounds) - totalParticipants;

    // Generate first-round matches
    const matches: Match[] = [];
    let participantIndex = 0;

    for (let i = 0; i < firstRoundMatches; i++) {
      // If we have byes, some players will advance automatically
      const hasBye = i < byes;

      if (hasBye) {
        // The player gets a bye, so no match is created
        participantIndex++;
      } else {
        // Create a match with two players
        const homePlayerOneId = shuffledParticipants[participantIndex++];
        const homePlayerTwoId = shuffledParticipants[participantIndex++];

        // For doubles format, players from the same team (pair) play on the same side
        // For now, we're assuming each player is individual for simplicity
        const match = new Match(
          uuidv4(),
          tournament.id,
          homePlayerOneId,
          homePlayerOneId, // Same player for both positions (single player per side)
          homePlayerTwoId,
          homePlayerTwoId, // Same player for both positions (single player per side)
          1, // First round
          null, // Date is null until scheduled
          null, // Location is null until scheduled
          MatchStatus.PENDING,
          null,
          null,
        );

        matches.push(match);
      }
    }

    // Save all matches
    for (const match of matches) {
      await this.matchRepository.save(match);
    }

    return {
      tournamentId: tournament.id,
      format: tournament.format,
      rounds,
      matchesCreated: matches.length,
    };
  }

  /**
   * Shuffles an array using the Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
