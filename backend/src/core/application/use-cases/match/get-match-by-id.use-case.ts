import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match } from '../../../domain/match/match.entity';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';

// Input validation schema
const GetMatchByIdInputSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid match ID format',
  }),
});

type GetMatchByIdInput = z.infer<typeof GetMatchByIdInputSchema>;

export class GetMatchByIdUseCase extends BaseUseCase<GetMatchByIdInput, Match> {
  constructor(private matchRepository: IMatchRepository) {
    super();
  }

  protected async executeImpl(input: GetMatchByIdInput): Promise<Result<Match>> {
    try {
      // Validate input
      const validation = GetMatchByIdInputSchema.safeParse(input);
      if (!validation.success) {
        return Result.fail<Match>(new Error(validation.error.errors[0].message));
      }

      const validatedData = validation.data;

      // Find match by ID
      const match = await this.matchRepository.findById(validatedData.id);
      if (!match) {
        return Result.fail<Match>(new Error('Match not found'));
      }

      return Result.ok<Match>(match);
    } catch (error) {
      // Return the original error to preserve the error message
      return Result.fail<Match>(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
