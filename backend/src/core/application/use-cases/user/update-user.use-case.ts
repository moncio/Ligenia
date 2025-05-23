import { BaseUseCase } from '../../base/base.use-case';
import { Result } from '../../../../shared/result';
import { User, UserRole } from '../../../domain/user/user.entity';
import { IUserRepository } from '../../interfaces/repositories/user.repository';
import { z } from 'zod';
import { injectable, inject } from 'inversify';
import { IAuthService } from '../../interfaces/auth-service.interface';
import { TYPES } from '../../../../config/di-container';

export interface UpdateUserInput {
  id: string;
  email?: string;
  name?: string;
  role?: UserRole;
}

@injectable()
export class UpdateUserUseCase extends BaseUseCase<UpdateUserInput, User> {
  constructor(
    @inject('UserRepository') private userRepository: IUserRepository,
    @inject('AuthService') private authService: IAuthService
  ) {
    super();
  }

  protected async executeImpl(input: UpdateUserInput): Promise<Result<User>> {
    // Validate input
    const schema = z.object({
      id: z.string().uuid({ message: 'Invalid user ID format' }),
      email: z.string().email({ message: 'Invalid email format' }).optional(),
      name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
      role: z.nativeEnum(UserRole, { 
        errorMap: () => ({ message: 'Role must be a valid user role' }) 
      }).optional(),
    });

    try {
      schema.parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return Result.fail<User>(new Error(error.errors[0].message));
      }
      return Result.fail<User>(new Error('Invalid input data'));
    }

    // Find user and update
    try {
      const existingUser = await this.userRepository.findById(input.id);
      
      if (!existingUser) {
        return Result.fail<User>(new Error('User not found'));
      }
      
      // Update only the fields that are provided
      if (input.email !== undefined) {
        // Check if email is already in use by another user
        if (input.email !== existingUser.email) {
          const userWithEmail = await this.userRepository.findByEmail(input.email);
          if (userWithEmail && userWithEmail.id !== existingUser.id) {
            return Result.fail<User>(new Error('Email is already in use'));
          }
          existingUser.email = input.email;
        }
      }
      
      if (input.name !== undefined) {
        existingUser.name = input.name;
      }
      
      if (input.role !== undefined) {
        existingUser.role = input.role;
      }
      
      // Update timestamp
      existingUser.updatedAt = new Date();
      
      // Save the updated user in our database
      await this.userRepository.update(existingUser);
      
      // Also update in Supabase Auth
      const updateData: any = {};
      if (input.email !== undefined) updateData.email = input.email;
      if (input.name !== undefined) updateData.name = input.name; 
      if (input.role !== undefined) updateData.role = input.role;
      
      if (Object.keys(updateData).length > 0) {
        const authResult = await this.authService.updateUser(existingUser.id, updateData);
        if (authResult.isFailure()) {
          console.error(`Failed to update user in Supabase Auth: ${authResult.getError().message}`);
          // We continue anyway since the user is already updated in our database
        }
      }
      
      return Result.ok<User>(existingUser);
    } catch (error) {
      return Result.fail<User>(
        error instanceof Error ? error : new Error('Failed to update user')
      );
    }
  }
} 