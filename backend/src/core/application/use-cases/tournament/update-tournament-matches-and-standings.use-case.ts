import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { TournamentStatus } from '../../../domain/tournament/tournament.entity';

// Define input validation schema using Zod
const updateTournamentMatchesAndStandingsSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' }),
});

// Define the input type using the Zod schema
export type UpdateTournamentMatchesAndStandingsInput = z.infer<
  typeof updateTournamentMatchesAndStandingsSchema
>;

// Define the output interface
export interface UpdateTournamentMatchesAndStandingsOutput {
  tournamentId: string;
  updatedStatus: TournamentStatus;
  nextRoundMatches: Match[];
  isComplete: boolean;
  winnerId?: string;
}

/**
 * Use case to update tournament progression after matches are completed
 * It advances players to the next round and creates new matches
 * If tournament is complete, it will update the tournament status
 */
export class UpdateTournamentMatchesAndStandingsUseCase extends BaseUseCase<
  UpdateTournamentMatchesAndStandingsInput,
  UpdateTournamentMatchesAndStandingsOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly matchRepository: IMatchRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: UpdateTournamentMatchesAndStandingsInput,
  ): Promise<Result<UpdateTournamentMatchesAndStandingsOutput>> {
    try {
      // Validate input
      const validationResult = updateTournamentMatchesAndStandingsSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(new Error(`Invalid input: ${validationResult.error.message}`));
      }

      const { tournamentId } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(new Error(`Tournament with ID ${tournamentId} not found`));
      }

      // Check if tournament is in ACTIVE state
      if (tournament.status !== TournamentStatus.ACTIVE) {
        return Result.fail(
          new Error(`Tournament is not in ACTIVE state, current state: ${tournament.status}`),
        );
      }

      // Get all matches for the tournament
      const allMatches = await this.matchRepository.findByFilter({ tournamentId });
      if (allMatches.length === 0) {
        return Result.fail(new Error(`No matches found for tournament ${tournamentId}`));
      }

      // Group matches by round
      const matchesByRound = this.groupMatchesByRound(allMatches);

      // Determine the current round
      const currentRound = this.determineCurrentRound(matchesByRound);

      // Get matches for the current round
      const currentRoundMatches = matchesByRound.get(currentRound) || [];

      // Check if all matches in the current round are completed
      const allMatchesCompleted = currentRoundMatches.every(
        match => match.status === MatchStatus.COMPLETED,
      );

      if (!allMatchesCompleted) {
        return Result.fail(new Error(`Not all matches in round ${currentRound} are completed yet`));
      }

      // Get winners from the current round
      const winners = this.getWinnersFromMatches(currentRoundMatches);

      // If there's only one winner and we're not in the first round, the tournament is complete
      const isComplete = winners.length === 1 && currentRound > 1;

      let nextRoundMatches: Match[] = [];

      if (isComplete) {
        // Tournament is complete, update status
        tournament.status = TournamentStatus.COMPLETED;
        await this.tournamentRepository.update(tournament);

        return Result.ok({
          tournamentId,
          updatedStatus: TournamentStatus.COMPLETED,
          nextRoundMatches: [],
          isComplete: true,
          winnerId: winners[0],
        });
      } else {
        // Create matches for the next round
        nextRoundMatches = await this.createNextRoundMatches(
          tournamentId,
          winners,
          currentRound + 1,
        );

        return Result.ok({
          tournamentId,
          updatedStatus: tournament.status,
          nextRoundMatches,
          isComplete: false,
        });
      }
    } catch (error) {
      return Result.fail(
        error instanceof Error
          ? error
          : new Error('Failed to update tournament matches and standings'),
      );
    }
  }

  /**
   * Group matches by round number
   */
  private groupMatchesByRound(matches: Match[]): Map<number, Match[]> {
    const matchesByRound = new Map<number, Match[]>();

    for (const match of matches) {
      if (!matchesByRound.has(match.round)) {
        matchesByRound.set(match.round, []);
      }
      matchesByRound.get(match.round)?.push(match);
    }

    return matchesByRound;
  }

  /**
   * Determine the current active round of the tournament
   */
  private determineCurrentRound(matchesByRound: Map<number, Match[]>): number {
    // Find the highest round where not all matches are completed
    const currentRound = 1;

    // Get sorted round numbers
    const rounds = Array.from(matchesByRound.keys()).sort((a, b) => a - b);

    for (const round of rounds) {
      const matches = matchesByRound.get(round) || [];
      // If all matches are completed, check the next round
      if (matches.every(match => match.status === MatchStatus.COMPLETED)) {
        // If this is the highest round, this is our current round
        if (round === Math.max(...rounds)) {
          return round;
        }
        // Otherwise check the next round
        continue;
      }
      // Found a round with incomplete matches
      return round;
    }

    return currentRound;
  }

  /**
   * Extract winners from a list of completed matches
   */
  private getWinnersFromMatches(matches: Match[]): string[] {
    const winners: string[] = [];

    for (const match of matches) {
      // For completed matches, determine the winner
      if (match.status === MatchStatus.COMPLETED) {
        // Skip matches with no scores (should not happen for completed matches)
        if (match.homeScore === null || match.awayScore === null) {
          continue;
        }

        // Determine winner based on scores
        const winner =
          match.homeScore > match.awayScore
            ? match.homePlayerOneId // Home player won
            : match.awayPlayerOneId; // Away player won

        winners.push(winner);
      }
    }

    return winners;
  }

  /**
   * Create the next round of matches based on winners from the current round
   */
  private async createNextRoundMatches(
    tournamentId: string,
    winners: string[],
    nextRound: number,
  ): Promise<Match[]> {
    const newMatches: Match[] = [];

    // Handle cases where there's an odd number of winners
    if (winners.length % 2 !== 0 && winners.length > 1) {
      // Give a bye to the last winner
      const lastWinner = winners.pop()!;
      winners.push(lastWinner);

      // Create a "bye" match for this player
      // Note: In a real scenario, this player automatically advances
      // but for transparency we create a match
      const byeMatch = new Match(
        undefined, // ID will be generated on save
        tournamentId,
        lastWinner,
        lastWinner, // Same player (usually would have player details)
        '', // No opponent - bye
        '', // No opponent - bye
        nextRound,
        new Date(Date.now() + 24 * 60 * 60 * 1000), // Schedule for tomorrow
        '', // Location to be determined
        MatchStatus.SCHEDULED,
        null,
        null,
      );

      await this.matchRepository.save(byeMatch);
      newMatches.push(byeMatch);
    }

    // Create matches by pairing winners
    for (let i = 0; i < winners.length - 1; i += 2) {
      const homePlayer = winners[i];
      const awayPlayer = winners[i + 1];

      const match = new Match(
        undefined, // ID will be generated on save
        tournamentId,
        homePlayer,
        homePlayer, // Same player (usually would have player details)
        awayPlayer,
        awayPlayer, // Same player (usually would have player details)
        nextRound,
        new Date(Date.now() + 24 * 60 * 60 * 1000), // Schedule for tomorrow
        '', // Location to be determined
        MatchStatus.SCHEDULED,
        null,
        null,
      );

      await this.matchRepository.save(match);
      newMatches.push(match);
    }

    return newMatches;
  }
}
