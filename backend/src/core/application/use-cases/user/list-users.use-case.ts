import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { User } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { injectable, inject } from 'inversify';

export interface ListUsersInput {
  limit?: number;
  offset?: number;
}

export interface ListUsersOutput {
  users: User[];
  total: number;
  limit: number;
  offset: number;
}

@injectable()
export class ListUsersUseCase extends BaseUseCase<ListUsersInput, ListUsersOutput> {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository
  ) {
    super();
  }

  protected async executeImpl(input: ListUsersInput): Promise<Result<ListUsersOutput>> {
    try {
      // Apply pagination defaults
      const limit = input.limit || 10;
      const offset = input.offset || 0;
      
      const users = await this.userRepository.findAll(limit, offset);
      const total = await this.userRepository.count();
      
      return Result.ok<ListUsersOutput>({
        users,
        total,
        limit,
        offset
      });
    } catch (error) {
      return Result.fail<ListUsersOutput>(
        error instanceof Error ? error : new Error('Failed to retrieve users list')
      );
    }
  }
} 