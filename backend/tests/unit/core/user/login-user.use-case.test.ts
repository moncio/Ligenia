import { LoginUserUseCase } from '../../../../src/core/application/use-cases/user/login-user.use-case';
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

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUserUseCase(mockAuthService);
  });

  it('should return a token for valid credentials', async () => {
    const mockTokenResponse: ITokenResponse = { 
      accessToken: 'mock-token', 
      refreshToken: 'mock-refresh-token',
      user: { id: '1', email: 'test@example.com', role: UserRole.PLAYER, emailVerified: true } 
    };
    mockAuthService.login.mockResolvedValue(Result.ok(mockTokenResponse));

    const result = await useCase.execute({ email: 'test@example.com', password: 'password123' });
    
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toEqual(mockTokenResponse);
    expect(mockAuthService.login).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password123' 
    });
  });

  it('should fail for invalid credentials', async () => {
    mockAuthService.login.mockResolvedValue(Result.fail(new Error('Invalid credentials')));

    const result = await useCase.execute({ email: 'wrong@example.com', password: 'wrongpassword' });
    
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toBe('Invalid credentials');
  });

  it('should fail for invalid input', async () => {
    const result = await useCase.execute({ email: 'invalid-email', password: '123' });
    
    expect(result.isFailure).toBe(true);
    expect(result.getError().message).toContain('email');
  });
}); 