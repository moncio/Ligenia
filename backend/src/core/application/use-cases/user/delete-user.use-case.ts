import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { z } from 'zod';
import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/auth-service.interface';

export interface DeleteUserInput {
  id: string;
}

@injectable()
export class DeleteUserUseCase extends BaseUseCase<DeleteUserInput, void> {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: IAuthService
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
      
      // Delete the user from the local database
      await this.userRepository.delete(input.id);
      
      // Delete the user from Supabase Auth
      const authResult = await this.authService.deleteUser(input.id);
      if (authResult.isFailure()) {
        console.error(`Failed to delete user from Supabase Auth: ${authResult.getError().message}`);
        // We continue anyway since the user is already deleted from our database
        // This could lead to the situation where a user exists in Supabase but not in our DB
      }
      
      return Result.ok<void>(undefined);
    } catch (error) {
      return Result.fail<void>(
        error instanceof Error ? error : new Error('Failed to delete user')
      );
    }
  }
} 