import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { z } from 'zod';
import { injectable, inject } from 'inversify';

export interface DeleteUserInput {
  id: string;
}

@injectable()
export class DeleteUserUseCase extends BaseUseCase<DeleteUserInput, void> {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository
  ) {
    super();
  }

  protected async executeImpl(input: DeleteUserInput): Promise<Result<void>> {
    // Validate input
    const schema = z.object({
      id: z.string().uuid({ message: 'Invalid user ID format' }),
    });

    try {
      schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail<void>(new Error(error.errors[0].message));
      }
      return Result.fail<void>(new Error('Invalid input data'));
    }

    try {
      // Check if the user exists
      const existingUser = await this.userRepository.findById(input.id);
      
      if (!existingUser) {
        return Result.fail<void>(new Error('User not found'));
      }
      
      // Delete the user
      await this.userRepository.delete(input.id);
      
      return Result.ok<void>(undefined);
    } catch (error) {
      return Result.fail<void>(
        error instanceof Error ? error : new Error('Failed to delete user')
      );
    }
  }
} 