import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Result } from '../../../shared/result';
import { IAuthService } from '../../../core/application/interfaces/auth-service.interface';
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
        options: {
          data: {
            name: data.name,
            role: data.role || 'PLAYER'
          }
        }
      });

      if (signUpError) {
        console.error('Error signing up user in Supabase Auth:', signUpError);
        return Result.fail(new AuthError(signUpError.message));
      }

      if (!authData.user) {
        return Result.fail(new AuthError('Failed to create user'));
      }

      // Create user record in our database with prisma
      const { data: newUser, error: insertError } = await this.supabase.from('User').insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role || 'PLAYER',
        emailVerified: false,
        password: '**hashed**', // This would actually be hashed, but we're not doing that here
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).select('id').single();

      if (insertError || !newUser) {
        console.error('Failed to insert user in local database:', insertError);
        
        // If we fail to insert in our DB, we should also delete the auth user
        await this.supabase.auth.admin.deleteUser(authData.user.id);
        return Result.fail(new AuthError('Failed to create user in local database'));
      }

      console.log(`User registered successfully: ${authData.user.id}`);

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
      console.error('Error registering user:', error);
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
      console.log('validateToken: Creating Supabase client with token');
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      });

      // Intentar obtener el usuario directamente con el token en los headers
      console.log('validateToken: Getting user from Supabase session using JWT in headers');
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        console.error('Error validating token or user not found in Supabase:', error);
        return Result.ok({ valid: false });
      }

      const supabaseUserId = data.user.id;
      console.log(`Token successfully validated for user ${supabaseUserId} in Supabase`);
      console.log(`User metadata from Supabase: ${JSON.stringify(data.user.user_metadata)}`);

      // Extraer rol desde metadatos de Supabase
      const supabaseRole = data.user.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'PLAYER';
      console.log(`Role from Supabase metadata: ${supabaseRole}`);

      try {
        // Importar PrismaClient directamente aquí para evitar dependencias circulares
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        console.log(`validateToken: Getting user details for ${supabaseUserId} directly from database with Prisma`);
        
        // Obtener el usuario directamente de la base de datos
        const dbUser = await prisma.user.findUnique({
          where: { id: supabaseUserId },
          select: { id: true, email: true, name: true, role: true, emailVerified: true }
        });
        
        await prisma.$disconnect();
        
        if (!dbUser) {
          console.log(`User ${supabaseUserId} exists in Supabase but not in local database.`);
          console.log(`We'll trust the Supabase information and return a valid token.`);
          
          // Si el usuario no existe en la base de datos local pero sí en Supabase,
          // devolvemos válido de todas formas con la información de Supabase
          return Result.ok({
            valid: true,
            user: {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.full_name || 
                    data.user.user_metadata?.name || 
                    data.user.email?.split('@')[0] || 
                    'User',
              role: supabaseRole, // Usar el rol detectado en Supabase
              emailVerified: !!data.user.email_confirmed_at,
            },
          });
        }
        
        console.log(`User ${supabaseUserId} found in both Supabase and local database`);
        
        // Si el rol en Supabase es ADMIN pero en la BD local es PLAYER, actualizamos el rol en la BD
        if (supabaseRole === 'ADMIN' && dbUser.role === 'PLAYER') {
          console.log(`Updating user ${supabaseUserId} role from PLAYER to ADMIN in local database`);
          try {
            await prisma.user.update({
              where: { id: supabaseUserId },
              data: { role: 'ADMIN' }
            });
            dbUser.role = 'ADMIN';
          } catch (updateError) {
            console.error('Error updating user role:', updateError);
          }
        }
        
        // Usuario encontrado en base de datos local
        return Result.ok({
          valid: true,
          user: {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            emailVerified: dbUser.emailVerified,
          },
        });
      } catch (dbError) {
        console.error('Error accessing database:', dbError);
        
        // Si hay un error de base de datos, confiamos en la información de Supabase
        return Result.ok({
          valid: true,
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || 
                  data.user.user_metadata?.name || 
                  data.user.email?.split('@')[0] || 
                  'User',
            role: supabaseRole, // Usar el rol detectado en Supabase
            emailVerified: !!data.user.email_confirmed_at,
          },
        });
      }
    } catch (error) {
      console.error('General error in validateToken:', error);
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
      // Check if user exists in our database first
      console.log(`getUserById: Checking if user ${userId} exists in local database`);
      const { data, error } = await this.supabase
        .from('User')
        .select('id, email, name, role, emailVerified')
        .eq('id', userId)
        .single();

      // User found in our database, return it
      if (data && !error) {
        console.log(`getUserById: User ${userId} found in local database`);
        return Result.ok({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          emailVerified: data.emailVerified,
        });
      }
      
      // If not found in our database, try to get public user info from Supabase
      // without using administrative API
      console.log(`getUserById: User ${userId} not found in local database, getting from Supabase Auth`);
      
      try {
        // Create a client with the token to get current user
        const { data: userData, error: userError } = await this.supabase.auth.getUser();
        
        if (userError || !userData.user || userData.user.id !== userId) {
          console.log(`getUserById: User ${userId} not found in Supabase Auth`);
          return Result.fail(new UserNotFoundError());
        }
        
        // Verificar si el usuario tiene rol de administrador en los metadatos
        const userRole = userData.user.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'PLAYER';
        console.log(`getUserById: User role from metadata: ${userRole}`);
        
        // Create user in our database
        console.log(`getUserById: Creating user ${userId} in local database with role ${userRole}`);
        const { data: newUser, error: insertError } = await this.supabase.from('User').insert({
          id: userData.user.id,
          email: userData.user.email || '',
          name: userData.user.user_metadata?.full_name || 
                userData.user.user_metadata?.name ||
                userData.user.email?.split('@')[0] || 
                'User',
          role: userRole, // Usar el rol de los metadatos
          emailVerified: userData.user.email_confirmed_at ? true : false,
          password: '**SUPABASE_AUTH**', // Campo obligatorio en la tabla User
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).select('id, email, name, role, emailVerified').single();

        if (insertError || !newUser) {
          console.error('Failed to create user in database:', insertError);
          return Result.fail(new UserNotFoundError());
        }
        
        console.log(`getUserById: Successfully created user ${userId} in local database`);
        
        // Return the newly created user
        return Result.ok({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          emailVerified: newUser.emailVerified,
        });
      } catch (authError) {
        console.error(`Error getting user from Supabase Auth:`, authError);
        return Result.fail(new UserNotFoundError());
      }
    } catch (error) {
      console.error('Error in getUserById:', error);
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

  /**
   * Delete user from auth provider and our database
   * @param userId User id to delete
   * @returns Result indicating success or failure
   */
  async deleteUser(userId: string): Promise<Result<void>> {
    try {
      console.log(`deleteUser: Deleting user ${userId} from Supabase Auth`);
      
      // First check if user exists
      const userExists = await this.getUserById(userId);
      if (userExists.isFailure) {
        return Result.fail(userExists.getError());
      }
      
      // Delete user from Supabase Auth
      const { error: authError } = await this.supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error(`Error deleting user ${userId} from Supabase Auth:`, authError);
        return Result.fail(new AuthError(authError.message));
      }
      
      console.log(`deleteUser: Successfully deleted user ${userId} from Supabase Auth`);
      
      return Result.ok<void>(undefined);
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return Result.fail(new AuthError((error as Error).message));
    }
  }
}
