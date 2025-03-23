import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match } from '../../../domain/match/match.entity';
import { ITournamentRepository } from '../../interfaces/repositories/tournament.repository';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';

// Schema for validation of get tournament bracket input
const getTournamentBracketSchema = z.object({
  tournamentId: z.string().uuid({ message: 'Tournament ID must be a valid UUID' })
});

// Input type inferred from the schema
export type GetTournamentBracketInput = z.infer<typeof getTournamentBracketSchema>;

// Match grouped by round for output
export interface MatchByRound {
  round: number;
  matches: Match[];
}

// Output DTO for tournament bracket
export interface GetTournamentBracketOutput {
  tournamentId: string;
  rounds: MatchByRound[];
  totalMatches: number;
  maxRound: number;
}

/**
 * Use case for retrieving the tournament bracket structure
 * Returns matches grouped by rounds in the correct order
 */
export class GetTournamentBracketUseCase extends BaseUseCase<
  GetTournamentBracketInput,
  GetTournamentBracketOutput
> {
  constructor(
    private readonly tournamentRepository: ITournamentRepository,
    private readonly matchRepository: IMatchRepository
  ) {
    super();
  }

  protected async executeImpl(
    input: GetTournamentBracketInput
  ): Promise<Result<GetTournamentBracketOutput>> {
    try {
      // Validate input
      const validationResult = getTournamentBracketSchema.safeParse(input);
      if (!validationResult.success) {
        return Result.fail(
          new Error(`Invalid input: ${validationResult.error.message}`)
        );
      }

      const { tournamentId } = validationResult.data;

      // Check if tournament exists
      const tournament = await this.tournamentRepository.findById(tournamentId);
      if (!tournament) {
        return Result.fail(
          new Error(`Tournament with ID ${tournamentId} not found`)
        );
      }

      // Retrieve all matches for the tournament
      const matches = await this.matchRepository.findByFilter({ tournamentId });
      
      // If no matches found, return empty bracket structure
      if (matches.length === 0) {
        return Result.ok({
          tournamentId,
          rounds: [],
          totalMatches: 0,
          maxRound: 0
        });
      }

      // Group matches by round
      const matchesByRound = this.groupMatchesByRound(matches);
      
      // Find the maximum round number
      const maxRound = Math.max(...matchesByRound.map(r => r.round));

      return Result.ok({
        tournamentId,
        rounds: matchesByRound,
        totalMatches: matches.length,
        maxRound
      });
    } catch (error) {
      return Result.fail(
        error instanceof Error 
          ? error 
          : new Error('Failed to get tournament bracket')
      );
    }
  }

  /**
   * Groups matches by round number and sorts them appropriately
   * @param matches Array of matches to group
   * @returns Grouped matches by round in ascending order
   */
  private groupMatchesByRound(matches: Match[]): MatchByRound[] {
    // Create a map of round number to matches
    const roundMap = new Map<number, Match[]>();
    
    // Group matches by round
    for (const match of matches) {
      const round = match.round;
      if (!roundMap.has(round)) {
        roundMap.set(round, []);
      }
      roundMap.get(round)?.push(match);
    }
    
    // Convert the map to an array of MatchByRound objects
    const result: MatchByRound[] = [];
    
    // Sort rounds in ascending order (e.g., round 1, round 2, etc.)
    const sortedRounds = Array.from(roundMap.keys()).sort((a, b) => a - b);
    
    for (const round of sortedRounds) {
      const matchesInRound = roundMap.get(round) || [];
      
      // Sort matches within a round by their ID to maintain consistent ordering
      // This ensures the bracket visualization is stable
      const sortedMatches = matchesInRound.sort((a, b) => a.id.localeCompare(b.id));
      
      result.push({
        round,
        matches: sortedMatches
      });
    }
    
    return result;
  }
} 