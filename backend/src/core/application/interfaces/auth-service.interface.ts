import {
  ILoginCredentials,
  IRegistrationData,
  ITokenResponse,
  ITokenValidationResponse,
  IAuthUser,
} from './auth.types';
import { Result } from '../../../shared/result';

export interface IAuthService {
  login(credentials: ILoginCredentials): Promise<Result<ITokenResponse>>;
  register(data: IRegistrationData): Promise<Result<ITokenResponse>>;
  validateToken(token: string): Promise<Result<ITokenValidationResponse>>;
  getUserById(userId: string): Promise<Result<IAuthUser>>;
  updateUser(userId: string, data: Partial<IAuthUser>): Promise<Result<IAuthUser>>;
  refreshToken(refreshToken: string): Promise<Result<ITokenResponse>>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
  generateToken(user: IAuthUser): Promise<string>;
  deleteUser(userId: string): Promise<Result<void>>;
}
