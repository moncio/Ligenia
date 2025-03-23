import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';

// Input validation schema
const UpdateMatchDetailsInputSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid match ID format'
  }),
  homePlayerOneId: z.string().uuid({
    message: 'Invalid home player one ID format'
  }).optional(),
  homePlayerTwoId: z.string().uuid({
    message: 'Invalid home player two ID format'
  }).optional(),
  awayPlayerOneId: z.string().uuid({
    message: 'Invalid away player one ID format'
  }).optional(),
  awayPlayerTwoId: z.string().uuid({
    message: 'Invalid away player two ID format'
  }).optional(),
  round: z.number().int().positive({
    message: 'Round must be a positive integer'
  }).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  status: z.nativeEnum(MatchStatus, {
    errorMap: () => ({ message: 'Invalid match status' })
  }).optional()
});

type UpdateMatchDetailsInput = z.infer<typeof UpdateMatchDetailsInputSchema>;

export class UpdateMatchDetailsUseCase extends BaseUseCase<UpdateMatchDetailsInput, Match> {
  constructor(
    private matchRepository: IMatchRepository
  ) {
    super();
  }

  protected async executeImpl(input: UpdateMatchDetailsInput): Promise<Result<Match>> {
    try {
      // Validate input
      const validation = UpdateMatchDetailsInputSchema.safeParse(input);
      if (!validation.success) {
        return Result.fail<Match>(new Error(validation.error.errors[0].message));
      }

      const validatedData = validation.data;

      // Find match by ID
      const match = await this.matchRepository.findById(validatedData.id);
      if (!match) {
        return Result.fail<Match>(new Error('Match not found'));
      }

      // Check if match can be modified
      if (!match.canModify()) {
        return Result.fail<Match>(new Error('Match cannot be modified in its current state'));
      }

      // Check for duplicate players if any are specified
      const uniquePlayerIds = new Set<string>();
      const homePlayerOneId = validatedData.homePlayerOneId || match.homePlayerOneId;
      const homePlayerTwoId = validatedData.homePlayerTwoId || match.homePlayerTwoId;
      const awayPlayerOneId = validatedData.awayPlayerOneId || match.awayPlayerOneId;
      const awayPlayerTwoId = validatedData.awayPlayerTwoId || match.awayPlayerTwoId;

      uniquePlayerIds.add(homePlayerOneId);
      uniquePlayerIds.add(homePlayerTwoId);
      uniquePlayerIds.add(awayPlayerOneId);
      uniquePlayerIds.add(awayPlayerTwoId);

      if (uniquePlayerIds.size !== 4) {
        return Result.fail<Match>(new Error('Duplicate players are not allowed'));
      }

      // Parse date if present
      const date = validatedData.date 
        ? new Date(validatedData.date) 
        : validatedData.date === null 
          ? null 
          : match.date;

      // Update match details
      match.updateDetails(
        validatedData.homePlayerOneId,
        validatedData.homePlayerTwoId,
        validatedData.awayPlayerOneId,
        validatedData.awayPlayerTwoId,
        validatedData.round,
        date,
        validatedData.location,
        validatedData.status
      );

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