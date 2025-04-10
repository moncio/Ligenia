import { LogoutUserUseCase } from '../../../../src/core/application/use-cases/user/logout-user.use-case';
import { Result } from '../../../../src/shared/result';
import { IAuthService } from '../../../../src/core/application/interfaces/auth-service.interface';
import { ITokenValidationResponse } from '../../../../src/core/application/interfaces/auth.types';
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
  deleteUser: jest.fn(),
};

describe('LogoutUserUseCase', () => {
  let useCase: LogoutUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LogoutUserUseCase(mockAuthService);

    // Set up the mock implementation for validateToken
    mockAuthService.validateToken.mockImplementation((token) => {
      if (token === 'valid-token-12345') {
        const validResponse: ITokenValidationResponse = {
          valid: true,
          user: { id: '1', email: 'test@example.com', role: UserRole.PLAYER, emailVerified: true },
        };
        const result = Result.ok<ITokenValidationResponse>(validResponse);
        return Promise.resolve(result);
      } else {
        const result = Result.fail<ITokenValidationResponse>(new Error('Invalid token'));
        return Promise.resolve(result);
      }
    });
  });

  it('should fail for an invalid token', async () => {
    const result = await useCase.execute({ token: 'invalid-token-12345' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Invalid token');
    expect(mockAuthService.validateToken).toHaveBeenCalledWith('invalid-token-12345');
  });

  it('should fail for invalid input format', async () => {
    const result = await useCase.execute({ token: 'short' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('character');
  });
  
  it('should succeed for a valid token', async () => {
    // Call the real method first so the validateToken gets called
    const result = await useCase.execute({ token: 'valid-token-12345' });
    
    // Then check the result using the method
    expect(result.isSuccess()).toBe(true);
    expect(mockAuthService.validateToken).toHaveBeenCalledWith('valid-token-12345');
  });
});
