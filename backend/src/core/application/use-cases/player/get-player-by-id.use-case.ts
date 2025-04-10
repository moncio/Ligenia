import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Player } from '../../../domain/player/player.entity';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';

// Input validation schema
const GetPlayerByIdInputSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid player ID format',
  }),
});

// Input type
export type GetPlayerByIdInput = z.infer<typeof GetPlayerByIdInputSchema>;

// Output type
export interface GetPlayerByIdOutput {
  player: Player;
}

/**
 * Use case for getting a player by ID
 */
export class GetPlayerByIdUseCase extends BaseUseCase<GetPlayerByIdInput, GetPlayerByIdOutput> {
  constructor(private readonly playerRepository: IPlayerRepository) {
    super();
  }

  protected async executeImpl(input: GetPlayerByIdInput): Promise<Result<GetPlayerByIdOutput>> {
    try {
      // Validate input first
      let validatedData: GetPlayerByIdInput;
      try {
        validatedData = await GetPlayerByIdInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<GetPlayerByIdOutput>(new Error(validationError.errors[0].message));
        }
        throw validationError;
      }

      // Find player
      const player = await this.playerRepository.findById(validatedData.id);
      if (!player) {
        return Result.fail<GetPlayerByIdOutput>(new Error('Player not found'));
      }

      return Result.ok<GetPlayerByIdOutput>({ player });
    } catch (error) {
      return Result.fail<GetPlayerByIdOutput>(
        error instanceof Error ? error : new Error('Failed to get player by ID'),
      );
    }
  }
}
