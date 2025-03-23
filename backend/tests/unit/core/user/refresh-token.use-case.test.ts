import { RefreshTokenUseCase } from '../../../../src/core/application/use-cases/user/refresh-token.use-case';
import { Result } from '../../../../src/shared/result';
import { IAuthService } from '../../../../src/core/application/interfaces/auth-service.interface';
import { ITokenResponse } from '../../../../src/core/application/interfaces/auth.types';
import { UserRole } from '../../../../src/core/domain/user/user.entity';

// Create a mock auth service
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

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RefreshTokenUseCase(mockAuthService);
  });

  it('should return a new token for a valid refresh token', async () => {
    const mockTokenResponse: ITokenResponse = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: { id: '1', email: 'test@example.com', role: UserRole.PLAYER, emailVerified: true },
    };
    mockAuthService.refreshToken.mockResolvedValue(Result.ok(mockTokenResponse));

    const result = await useCase.execute({ refreshToken: 'valid-refresh-token-12345' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(mockTokenResponse);
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('valid-refresh-token-12345');
  });

  it('should fail for an invalid refresh token', async () => {
    mockAuthService.refreshToken.mockResolvedValue(Result.fail(new Error('Invalid refresh token')));

    const result = await useCase.execute({ refreshToken: 'invalid-token-12345' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Invalid refresh token');
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('invalid-token-12345');
  });

  it('should fail for invalid input format', async () => {
    const result = await useCase.execute({ refreshToken: 'short' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('character');
  });
});
