import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { z } from 'zod';
import { Player } from '../../../domain/player/player.entity';
import { IPlayerRepository } from '../../interfaces/repositories/player.repository';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { PlayerLevel } from '../../../domain/tournament/tournament.entity';
import { UserRole } from '../../../domain/user/user.entity';

// Input validation schema
const UpdatePlayerProfileInputSchema = z.object({
  id: z.string().uuid({
    message: 'Invalid player ID format'
  }),
  requestingUserId: z.string().uuid({
    message: 'Invalid user ID format'
  }),
  level: z.nativeEnum(PlayerLevel, {
    errorMap: () => ({ message: 'Level must be a valid PlayerLevel' })
  }).optional(),
  age: z.number().int().positive().optional().nullable(),
  country: z.string().min(2, {
    message: 'Country must be at least 2 characters'
  }).optional().nullable(),
  avatarUrl: z.string().url({
    message: 'Avatar URL must be a valid URL'
  }).optional().nullable()
});

// Input type
export type UpdatePlayerProfileInput = z.infer<typeof UpdatePlayerProfileInputSchema>;

// Output type
export interface UpdatePlayerProfileOutput {
  success: boolean;
}

/**
 * Use case for updating a player profile
 */
export class UpdatePlayerProfileUseCase extends BaseUseCase<
  UpdatePlayerProfileInput,
  UpdatePlayerProfileOutput
> {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly userRepository: IUserRepository
  ) {
    super();
  }

  protected async executeImpl(input: UpdatePlayerProfileInput): Promise<Result<UpdatePlayerProfileOutput>> {
    try {
      // Validate input first
      let validatedData: UpdatePlayerProfileInput;
      try {
        validatedData = await UpdatePlayerProfileInputSchema.parseAsync(input);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return Result.fail<UpdatePlayerProfileOutput>(
            new Error(validationError.errors[0].message)
          );
        }
        throw validationError;
      }

      // Find player
      const player = await this.playerRepository.findById(validatedData.id);
      if (!player) {
        return Result.fail<UpdatePlayerProfileOutput>(
          new Error('Player not found')
        );
      }

      // Check if requesting user exists
      const requestingUser = await this.userRepository.findById(validatedData.requestingUserId);
      if (!requestingUser) {
        return Result.fail<UpdatePlayerProfileOutput>(
          new Error('User not found')
        );
      }

      // Check if user is authorized to update this player
      // Only the owner or admin can update a player's profile
      if (
        player.userId !== requestingUser.id &&
        requestingUser.role !== UserRole.ADMIN
      ) {
        return Result.fail<UpdatePlayerProfileOutput>(
          new Error('Not authorized to update this player profile')
        );
      }

      // Update player profile
      player.updateProfile({
        level: validatedData.level,
        age: validatedData.age,
        country: validatedData.country,
        avatarUrl: validatedData.avatarUrl
      });

      // Save updated player
      await this.playerRepository.update(player);

      return Result.ok<UpdatePlayerProfileOutput>({ success: true });
    } catch (error) {
      return Result.fail<UpdatePlayerProfileOutput>(
        error instanceof Error ? error : new Error('Failed to update player profile')
      );
    }
  }
} 