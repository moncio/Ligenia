import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { User, UserRole } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { z } from 'zod';

interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  role: string;
}

export class RegisterUserUseCase extends BaseUseCase<RegisterUserInput, User> {
  constructor(private userRepository: IUserRepository) {
    super();
  }

  protected async executeImpl(input: RegisterUserInput): Promise<Result<User>> {
    const userSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      role: z.enum(['ADMIN', 'PLAYER']),
    });

    try {
      userSchema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail<User>(new Error(error.errors[0].message));
      }
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      return Result.fail<User>(new Error('Email already in use'));
    }

    const newUser = new User(
      '',
      input.email,
      input.password,
      input.name,
      input.role as UserRole
    );

    await this.userRepository.save(newUser);
    return Result.ok<User>(newUser);
  }
} 