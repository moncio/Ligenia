import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { User, UserRole } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { z } from 'zod';
import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { TYPES } from '../../../../config/di-container';

interface RegisterUserInput {
  email: string;
  password: string;
  name: string;
  role: string;
}

@injectable()
export class RegisterUserUseCase extends BaseUseCase<RegisterUserInput, User> {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: IAuthService
  ) {
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
      return Result.fail<User>(new Error('Invalid input data'));
    }

    try {
      // Check if user exists locally
      const existingUser = await this.userRepository.findByEmail(input.email);
      if (existingUser) {
        return Result.fail<User>(new Error('Email already in use'));
      }

      // Register with Supabase first to get the user ID
      const registerResult = await this.authService.register({
        email: input.email,
        password: input.password,
        name: input.name,
        role: input.role
      });

      if (registerResult.isFailure()) {
        return Result.fail<User>(registerResult.getError());
      }

      const authUser = registerResult.getValue().user;

      // Create the user in our local database with ID from Supabase
      const newUser = new User(
        authUser.id, 
        input.email, 
        input.password, 
        input.name, 
        input.role as UserRole
      );

      await this.userRepository.save(newUser);
      return Result.ok<User>(newUser);
    } catch (error) {
      return Result.fail<User>(
        error instanceof Error ? error : new Error('Failed to register user')
      );
    }
  }
}
