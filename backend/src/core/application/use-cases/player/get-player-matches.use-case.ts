import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Match, MatchStatus } from '../../../domain/match/match.entity';
import { IMatchRepository } from '../../interfaces/repositories/match.repository';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';

// Input validation schema
const GetPlayerMatchesInputSchema = z.object({
  playerId: z.string().uuid({
    message: 'Invalid player ID format',
  }),
  status: z
    .nativeEnum(MatchStatus, {
      errorMap: () => ({ message: 'Invalid match status' }),
    })
    .optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  tournamentId: z
    .string()
    .uuid({
      message: 'Invalid tournament ID format',
    })
    .optional(),
  skip: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().default(10),
});

// Input type
export type GetPlayerMatchesInput = z.infer<typeof GetPlayerMatchesInputSchema>;

// Output type
export interface GetPlayerMatchesOutput {
  matches: Match[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Use case for getting a player's matches with filtering and pagination
 */
export class GetPlayerMatchesUseCase extends BaseUseCase<
  GetPlayerMatchesInput,
  GetPlayerMatchesOutput
> {
  constructor(
    private readonly matchRepository: IMatchRepository,
    private readonly playerRepository: IPlayerRepository,
  ) {
    super();
  }

  protected async executeImpl(
    input: GetPlayerMatchesInput,
  ): Promise<Result<GetPlayerMatchesOutput>> {
    try {
      // Validate input first
      let validatedData: GetPlayerMatchesInput;
      try {
        validatedData = await GetPlayerMatchesInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<GetPlayerMatchesOutput>(new Error(validationError.errors[0].message));
        }
        throw validationError;
      }

      // Check if the player exists
      const player = await this.playerRepository.findById(validatedData.playerId);
      if (!player) {
        return Result.fail<GetPlayerMatchesOutput>(new Error('Player not found'));
      }

      // Prepare the filter
      const filter = {
        userId: player.userId,
        status: validatedData.status,
        fromDate: validatedData.fromDate,
        toDate: validatedData.toDate,
        tournamentId: validatedData.tournamentId,
        limit: validatedData.limit,
        offset: validatedData.skip,
      };

      // Get matches
      const matches = await this.matchRepository.findByFilter(filter);
      const total = await this.matchRepository.count(filter);

      return Result.ok<GetPlayerMatchesOutput>({
        matches,
        total,
        skip: validatedData.skip,
        limit: validatedData.limit,
      });
    } catch (error) {
      return Result.fail<GetPlayerMatchesOutput>(
        error instanceof Error ? error : new Error('Failed to get player matches'),
      );
    }
  }
}
