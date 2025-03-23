import { Result } from '../../../shared/result';

export interface IAuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  emailVerified: boolean;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegistrationData {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken?: string;
  user: IAuthUser;
}

export interface ITokenValidationResponse {
  valid: boolean;
  user?: IAuthUser;
} 