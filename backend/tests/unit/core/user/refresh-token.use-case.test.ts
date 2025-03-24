import { IAuthService } from '../../../../src/core/application/interfaces/auth-service.interface';
import { RefreshTokenUseCase } from '../../../../src/core/application/use-cases/user/refresh-token.use-case';
import { Result } from '../../../../src/shared/result';
import { IAuthUser, ITokenResponse } from '../../../../src/core/application/interfaces/auth.types';
import { UserRole } from '../../../../src/core/domain/user/user.entity';

describe('RefreshTokenUseCase', () => {
  // Mock user and token response for successful refresh
  const mockUser: IAuthUser = {
    id: '1',
    email: 'test@example.com',
    role: UserRole.PLAYER,
    emailVerified: true
  };
  
  const mockTokenResponse: ITokenResponse = { 
    accessToken: 'new-jwt-token-12345', 
    refreshToken: 'new-refresh-token-12345',
    user: mockUser
  };
  
  // Mock AuthService
  const mockAuthService: jest.Mocked<IAuthService> = {
    login: jest.fn(),
    register: jest.fn(),
    validateToken: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    refreshToken: jest.fn(),
    verifyPassword: jest.fn(),
    generateToken: jest.fn(),
  };

  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RefreshTokenUseCase(mockAuthService);
    
    // Set up mock implementation for refreshToken
    mockAuthService.refreshToken.mockImplementation((refreshToken) => {
      if (refreshToken === 'valid-refresh-token-12345') {
        return Promise.resolve(Result.ok(mockTokenResponse));
      }
      return Promise.resolve(Result.fail(new Error('Invalid refresh token')));
    });
  });

  it('should return a new token for a valid refresh token', async () => {
    const result = await useCase.execute({ refreshToken: 'valid-refresh-token-12345' });

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).toEqual(mockTokenResponse);
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token-12345');
  });

  it('should fail for an invalid refresh token', async () => {
    const result = await useCase.execute({ refreshToken: 'invalid-token-12345' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Invalid refresh token');
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('invalid-token-12345');
  });

  it('should fail for invalid input format', async () => {
    const result = await useCase.execute({ refreshToken: 'short' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('character');
  });
});
