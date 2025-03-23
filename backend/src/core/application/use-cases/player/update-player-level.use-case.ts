import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';

// Input validation schema
const UpdatePlayerLevelInputSchema = z.object({
  playerId: z.string().uuid({
    message: 'Invalid player ID format'
  }),
  level: z.nativeEnum(PlayerLevel, {
    errorMap: () => ({ message: 'Invalid player level' })
  })
});

// Input type
export type UpdatePlayerLevelInput = z.infer<typeof UpdatePlayerLevelInputSchema>;

// Output type
export interface UpdatePlayerLevelOutput {
  message: string;
}

/**
 * Use case for updating a player's level
 */
export class UpdatePlayerLevelUseCase extends BaseUseCase<
  UpdatePlayerLevelInput,
  UpdatePlayerLevelOutput
> {
  constructor(
    private readonly playerRepository: IPlayerRepository
  ) {
    super();
  }

  protected async executeImpl(input: UpdatePlayerLevelInput): Promise<Result<UpdatePlayerLevelOutput>> {
    try {
      // Validate input first
      try {
        await UpdatePlayerLevelInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          const errorMessage = validationError.errors.map(err => `${err.path}: ${err.message}`).join(', ');
          return Result.fail(new Error(`Invalid input: ${errorMessage}`));
        }
        throw validationError;
      }

      // Check if player exists
      const player = await this.playerRepository.findById(input.playerId);
      if (!player) {
        return Result.fail(new Error('Player not found'));
      }

      // Update only the level field
      player.level = input.level;
      
      // Save the updated player
      await this.playerRepository.update(player);

      return Result.ok({
        message: `Player level updated to ${input.level} successfully`
      });
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Failed to update player level'));
    }
  }
} 