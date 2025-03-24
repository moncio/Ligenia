import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { User } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { z } from 'zod';
import { injectable, inject } from 'inversify';

export interface GetUserByIdInput {
  id: string;
}

@injectable()
export class GetUserByIdUseCase extends BaseUseCase<GetUserByIdInput, User | null> {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository
  ) {
    super();
  }

  protected async executeImpl(input: GetUserByIdInput): Promise<Result<User | null>> {
    // Validate input
    const schema = z.object({
      id: z.string().uuid({ message: 'Invalid user ID format' }),
    });

    try {
      schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail<User | null>(new Error(error.errors[0].message));
      }
      return Result.fail<User | null>(new Error('Invalid input data'));
    }

    // Retrieve user from repository
    try {
      const user = await this.userRepository.findById(input.id);
      
      if (!user) {
        return Result.fail<User | null>(new Error('User not found'));
      }
      
      return Result.ok<User>(user);
    } catch (error) {
      return Result.fail<User | null>(
        error instanceof Error ? error : new Error('Failed to retrieve user')
      );
    }
  }
} 