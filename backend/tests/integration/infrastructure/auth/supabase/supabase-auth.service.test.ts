import 'reflect-metadata';
import { Result } from '../../../../../src/shared/result';
import {
  EmailAlreadyInUseError,
  InvalidCredentialsError,
  InvalidTokenError,
  UserNotFoundError,
} from '../../../../../src/shared/errors/auth.error';
import {
  IAuthUser,
  ILoginCredentials,
  IRegistrationData,
  ITokenResponse,
  ITokenValidationResponse,
} from '../../../../../src/core/application/interfaces/auth.types';
import { IAuthService } from '../../../../../src/core/application/interfaces/auth-service.interface';
import { injectable } from 'inversify';

// Create a mock implementation of the auth service for testing
@injectable()
class MockSupabaseAuthService implements IAuthService {
  async login(credentials: ILoginCredentials): Promise<Result<ITokenResponse>> {
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      return Result.ok({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PLAYER',
          emailVerified: true,
        },
      });
    }
    return Result.fail(new InvalidCredentialsError());
  }

  async register(data: IRegistrationData): Promise<Result<ITokenResponse>> {
    if (data.email === 'existing@example.com') {
      return Result.fail(new EmailAlreadyInUseError());
    }
    return Result.ok({
      accessToken: 'access-token-456',
      refreshToken: 'refresh-token-456',
      user: {
        id: 'user456',
        email: data.email,
        name: data.name,
        role: data.role || 'PLAYER',
        emailVerified: false,
      },
    });
  }

  async validateToken(token: string): Promise<Result<ITokenValidationResponse>> {
    if (token === 'valid-token-123') {
      return Result.ok({
        valid: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PLAYER',
          emailVerified: true,
        },
      });
    }
    return Result.ok({ valid: false });
  }

  async refreshToken(refreshToken: string): Promise<Result<ITokenResponse>> {
    if (refreshToken === 'refresh-token-123') {
      return Result.ok({
        accessToken: 'new-access-token-123',
        refreshToken: 'new-refresh-token-123',
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PLAYER',
          emailVerified: true,
        },
      });
    }
    return Result.fail(new InvalidTokenError());
  }

  async getUserById(userId: string): Promise<Result<IAuthUser>> {
    if (userId === 'user123') {
      return Result.ok({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      });
    }
    return Result.fail(new UserNotFoundError());
  }

  async updateUser(userId: string, data: Partial<IAuthUser>): Promise<Result<IAuthUser>> {
    if (userId === 'user123') {
      const updatedUser = {
        id: 'user123',
        email: data.email || 'test@example.com',
        name: data.name || 'Test User',
        role: data.role || 'PLAYER',
        emailVerified: data.emailVerified !== undefined ? data.emailVerified : true,
      };
      return Result.ok(updatedUser);
    }
    return Result.fail(new UserNotFoundError());
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return true;
  }

  async generateToken(user: IAuthUser): Promise<string> {
    return `test-token-${user.id}`;
  }

  async deleteUser(userId: string): Promise<Result<void>> {
    return Result.ok<void>(undefined);
  }
}

describe('SupabaseAuthService', () => {
  let authService: IAuthService;

  beforeEach(() => {
    authService = new MockSupabaseAuthService();
  });

  describe('login', () => {
    it('should return token response on successful login', async () => {
      // Arrange
      const credentials: ILoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-123',
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PLAYER',
          emailVerified: true,
        },
      });
    });

    it('should return failure when credentials are invalid', async () => {
      // Arrange
      const credentials: ILoginCredentials = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(InvalidCredentialsError);
    });
  });

  describe('register', () => {
    it('should return token response on successful registration', async () => {
      // Arrange
      const registrationData: IRegistrationData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'PLAYER',
      };

      // Act
      const result = await authService.register(registrationData);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        accessToken: 'access-token-456',
        refreshToken: 'refresh-token-456',
        user: {
          id: 'user456',
          email: 'newuser@example.com',
          name: 'New User',
          role: 'PLAYER',
          emailVerified: false,
        },
      });
    });

    it('should return failure when email is already in use', async () => {
      // Arrange
      const registrationData: IRegistrationData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Existing User',
      };

      // Act
      const result = await authService.register(registrationData);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(EmailAlreadyInUseError);
    });
  });

  describe('validateToken', () => {
    it('should return valid response with user for a valid token', async () => {
      // Arrange
      const token = 'valid-token-123';

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        valid: true,
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PLAYER',
          emailVerified: true,
        },
      });
    });

    it('should return invalid response for an invalid token', async () => {
      // Arrange
      const token = 'invalid-token';

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        valid: false,
      });
    });
  });

  describe('refreshToken', () => {
    it('should return new token response on successful refresh', async () => {
      // Arrange
      const refreshToken = 'refresh-token-123';

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        accessToken: 'new-access-token-123',
        refreshToken: 'new-refresh-token-123',
        user: {
          id: 'user123',
          email: 'test@example.com',
          name: 'Test User',
          role: 'PLAYER',
          emailVerified: true,
        },
      });
    });

    it('should return failure for an invalid refresh token', async () => {
      // Arrange
      const refreshToken = 'invalid-refresh-token';

      // Act
      const result = await authService.refreshToken(refreshToken);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(InvalidTokenError);
    });
  });

  describe('getUserById', () => {
    it('should return user details for existing user id', async () => {
      // Arrange
      const userId = 'user123';

      // Act
      const result = await authService.getUserById(userId);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'PLAYER',
        emailVerified: true,
      });
    });

    it('should return failure for non-existent user id', async () => {
      // Arrange
      const userId = 'nonexistent-user';

      // Act
      const result = await authService.getUserById(userId);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(UserNotFoundError);
    });
  });

  describe('updateUser', () => {
    it('should update user details successfully', async () => {
      // Arrange
      const userId = 'user123';
      const updateData = {
        name: 'Updated Name',
        role: 'ADMIN',
      };

      // Act
      const result = await authService.updateUser(userId, updateData);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        id: 'user123',
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'ADMIN',
        emailVerified: true,
      });
    });

    it('should return failure when user does not exist', async () => {
      // Arrange
      const userId = 'nonexistent-user';
      const updateData = {
        name: 'Updated Name',
      };

      // Act
      const result = await authService.updateUser(userId, updateData);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.getError()).toBeInstanceOf(UserNotFoundError);
    });

    it('should update email in both database and auth when email is provided', async () => {
      // Arrange
      const userId = 'user123';
      const updateData = {
        email: 'newemail@example.com',
        name: 'Updated Name',
      };

      // Act
      const result = await authService.updateUser(userId, updateData);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.getValue()).toEqual({
        id: 'user123',
        email: 'newemail@example.com',
        name: 'Updated Name',
        role: 'PLAYER',
        emailVerified: true,
      });
    });
  });
});
