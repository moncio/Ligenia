import { Result } from '../../../shared/result';

/**
 * User authentication data interface
 */
export interface IAuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  emailVerified: boolean;
}

/**
 * Login credentials interface
 */
export interface ILoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data interface
 */
export interface IRegistrationData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

/**
 * Token response interface
 */
export interface ITokenResponse {
  accessToken: string;
  refreshToken?: string;
  user: IAuthUser;
}

/**
 * Token validation response interface
 */
export interface ITokenValidationResponse {
  valid: boolean;
  user?: IAuthUser;
}

/**
 * Auth service interface
 * Defines methods for authentication operations
 */
export interface IAuthService {
  /**
   * Login a user with email and password
   * @param credentials Login credentials
   * @returns Result with token response or error
   */
  login(credentials: ILoginCredentials): Promise<Result<ITokenResponse>>;

  /**
   * Register a new user
   * @param data Registration data
   * @returns Result with token response or error
   */
  register(data: IRegistrationData): Promise<Result<ITokenResponse>>;

  /**
   * Validate a token
   * @param token JWT token to validate
   * @returns Result with token validation response or error
   */
  validateToken(token: string): Promise<Result<ITokenValidationResponse>>;

  /**
   * Get user by id from auth provider
   * @param userId User id
   * @returns Result with auth user or error
   */
  getUserById(userId: string): Promise<Result<IAuthUser>>;

  /**
   * Update user in auth provider
   * @param userId User id
   * @param data Data to update
   * @returns Result with updated auth user or error
   */
  updateUser(userId: string, data: Partial<IAuthUser>): Promise<Result<IAuthUser>>;

  /**
   * Refresh tokens
   * @param refreshToken Refresh token
   * @returns Result with new token response or error
   */
  refreshToken(refreshToken: string): Promise<Result<ITokenResponse>>;
} 