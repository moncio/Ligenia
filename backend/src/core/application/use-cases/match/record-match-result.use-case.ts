import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';

// Input validation schema
const RecordMatchResultInputSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid match ID format'
  }),
  homeScore: z.number().int().nonnegative({
    message: 'Home score must be a non-negative integer'
  }),
  awayScore: z.number().int().nonnegative({
    message: 'Away score must be a non-negative integer'
  })
}).refine((data) => data.homeScore !== data.awayScore, {
  message: 'Scores cannot be equal, a winner must be determined',
  path: ['homeScore'] // Path to the field that will receive the error
});

type RecordMatchResultInput = z.infer<typeof RecordMatchResultInputSchema>;

export class RecordMatchResultUseCase extends BaseUseCase<RecordMatchResultInput, Match> {
  constructor(
    private matchRepository: IMatchRepository
  ) {
    super();
  }

  protected async executeImpl(input: RecordMatchResultInput): Promise<Result<Match>> {
    try {
      // Validate input
      const validation = RecordMatchResultInputSchema.safeParse(input);
      if (!validation.success) {
        return Result.fail<Match>(new Error(validation.error.errors[0].message));
      }

      const validatedData = validation.data;

      // Find match by ID
      const match = await this.matchRepository.findById(validatedData.id);
      if (!match) {
        return Result.fail<Match>(new Error('Match not found'));
      }

      // Check if match is in the correct state (IN_PROGRESS)
      if (match.status !== MatchStatus.IN_PROGRESS) {
        return Result.fail<Match>(new Error('Only matches in IN_PROGRESS state can have results recorded'));
      }

      // Record the match result
      try {
        match.updateScore(validatedData.homeScore, validatedData.awayScore);
      } catch (error) {
        return Result.fail<Match>(
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Save updated match
      await this.matchRepository.save(match);

      return Result.ok<Match>(match);
    } catch (error) {
      return Result.fail<Match>(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
} 