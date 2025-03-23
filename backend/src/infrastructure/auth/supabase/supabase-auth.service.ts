import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Result } from '../../../shared/result';
import {
  IAuthService } from '../../../core/application/interfaces/auth-service.interface';
import {
  IAuthUser,
  ILoginCredentials,
  IRegistrationData,
  ITokenResponse,
  ITokenValidationResponse,
} from '../../../core/application/interfaces/auth.types';
import {
  AuthError,
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  InvalidTokenError,
  UnauthorizedError,
  UserNotFoundError,
} from '../../../shared/errors/auth.error';
import { injectable } from 'inversify';

/**
 * Authentication service implementation using Supabase
 */
@injectable()
export class SupabaseAuthService implements IAuthService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key must be provided');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Login a user with email and password
   * @param credentials Login credentials
   * @returns Result with token response or error
   */
  async login(credentials: ILoginCredentials): Promise<Result<ITokenResponse>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return Result.fail(new InvalidCredentialsError());
      }

      // Get user details including role and email verification status
      const userDetailsResult = await this.getUserById(data.user.id);
      if (userDetailsResult.isFailure) {
        return Result.fail(userDetailsResult.getError());
      }

      const userDetails = userDetailsResult.getValue();

      return Result.ok({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: userDetails.name,
          role: userDetails.role,
          emailVerified: userDetails.emailVerified,
        },
      });
    } catch (error) {
      return Result.fail(new AuthError((error as Error).message));
    }
  }

  /**
   * Register a new user
   * @param data Registration data
   * @returns Result with token response or error
   */
  async register(data: IRegistrationData): Promise<Result<ITokenResponse>> {
    try {
      // Check if email exists
      const { data: existingUser, error: checkError } = await this.supabase
        .from('User')
        .select('email')
        .eq('email', data.email)
        .single();

      if (existingUser) {
        return Result.fail(new EmailAlreadyInUseError());
      }

      // Register user with Supabase auth
      const { data: authData, error: signUpError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        return Result.fail(new AuthError(signUpError.message));
      }

      if (!authData.user) {
        return Result.fail(new AuthError('Failed to create user'));
      }

      // Create user record in our database with prisma
      // This would typically be handled elsewhere in a proper implementation
      // Here we're just inserting directly with Supabase for simplicity
      const { error: insertError } = await this.supabase.from('User').insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role || 'PLAYER',
        emailVerified: false,
        password: '**hashed**', // This would actually be hashed, but we're not doing that here
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      if (insertError) {
        // If we fail to insert in our DB, we should also delete the auth user
        await this.supabase.auth.admin.deleteUser(authData.user.id);
        return Result.fail(new AuthError(insertError.message));
      }

      return Result.ok({
        accessToken: authData.session?.access_token ?? '',
        refreshToken: authData.session?.refresh_token ?? '',
        user: {
          id: authData.user.id,
          email: authData.user.email ?? '',
          name: data.name,
          role: data.role || 'PLAYER',
          emailVerified: false,
        },
      });
    } catch (error) {
      return Result.fail(new AuthError((error as Error).message));
    }
  }

  /**
   * Validate a token
   * @param token JWT token to validate
   * @returns Result with token validation response or error
   */
  async validateToken(token: string): Promise<Result<ITokenValidationResponse>> {
    try {
      // Create a new supabase client with the token
      const supabase = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        },
      );

      // Get user from session
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return Result.ok({ valid: false });
      }

      // Get user details including role
      const userDetailsResult = await this.getUserById(data.user.id);
      if (userDetailsResult.isFailure) {
        return Result.ok({ valid: false });
      }

      const userDetails = userDetailsResult.getValue();

      return Result.ok({
        valid: true,
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: userDetails.name,
          role: userDetails.role,
          emailVerified: userDetails.emailVerified,
        },
      });
    } catch (error) {
      return Result.fail(new InvalidTokenError());
    }
  }

  /**
   * Get user by id from auth provider and our database
   * @param userId User id
   * @returns Result with auth user or error
   */
  async getUserById(userId: string): Promise<Result<IAuthUser>> {
    try {
      // Get user from our database
      const { data, error } = await this.supabase
        .from('User')
        .select('id, email, name, role, emailVerified')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return Result.fail(new UserNotFoundError());
      }

      return Result.ok({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        emailVerified: data.emailVerified,
      });
    } catch (error) {
      return Result.fail(new AuthError((error as Error).message));
    }
  }

  /**
   * Update user in auth provider and our database
   * @param userId User id
   * @param data Data to update
   * @returns Result with updated auth user or error
   */
  async updateUser(userId: string, data: Partial<IAuthUser>): Promise<Result<IAuthUser>> {
    try {
      // First check if user exists
      const userExists = await this.getUserById(userId);
      if (userExists.isFailure) {
        return Result.fail(userExists.getError());
      }

      // Update in our database
      const { data: updatedUser, error } = await this.supabase
        .from('User')
        .update({
          ...data,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', userId)
        .select('id, email, name, role, emailVerified')
        .single();

      if (error || !updatedUser) {
        return Result.fail(new AuthError('Failed to update user'));
      }

      // If email is being updated, also update in Supabase Auth
      if (data.email) {
        const { error: authError } = await this.supabase.auth.admin.updateUserById(userId, {
          email: data.email,
        });

        if (authError) {
          return Result.fail(new AuthError(authError.message));
        }
      }

      return Result.ok({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        emailVerified: updatedUser.emailVerified,
      });
    } catch (error) {
      return Result.fail(new AuthError((error as Error).message));
    }
  }

  /**
   * Refresh tokens
   * @param refreshToken Refresh token
   * @returns Result with new token response or error
   */
  async refreshToken(refreshToken: string): Promise<Result<ITokenResponse>> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        return Result.fail(new InvalidTokenError());
      }

      // Get user details
      const userDetailsResult = await this.getUserById(data.user.id);
      if (userDetailsResult.isFailure) {
        return Result.fail(userDetailsResult.getError());
      }

      const userDetails = userDetailsResult.getValue();

      return Result.ok({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email ?? '',
          name: userDetails.name,
          role: userDetails.role,
          emailVerified: userDetails.emailVerified,
        },
      });
    } catch (error) {
      return Result.fail(new InvalidTokenError());
    }
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    // Supabase handles password verification internally, so this is a placeholder
    return true;
  }

  async generateToken(user: IAuthUser): Promise<string> {
    // Supabase handles token generation internally, so this is a placeholder
    return 'supabase-generated-token';
  }
} 