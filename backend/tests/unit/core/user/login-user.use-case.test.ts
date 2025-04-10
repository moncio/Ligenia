import { IAuthService } from '../../../../src/core/application/interfaces/auth-service.interface';
import { LoginUserUseCase } from '../../../../src/core/application/use-cases/user/login-user.use-case';
import { Result } from '../../../../src/shared/result';
import { IAuthUser, ITokenResponse } from '../../../../src/core/application/interfaces/auth.types';
import { UserRole } from '../../../../src/core/domain/user/user.entity';

describe('LoginUserUseCase', () => {
  // Mock user and token response for successful login
  const mockUser: IAuthUser = {
    id: '1',
    email: 'test@example.com',
    role: UserRole.PLAYER,
    emailVerified: true
  };
  
  const mockTokenResponse: ITokenResponse = { 
    accessToken: 'jwt-token-12345', 
    refreshToken: 'refresh-token-12345',
    user: mockUser
  };
  
  // Mock auth service
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

  let useCase: LoginUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUserUseCase(mockAuthService);
    
    // Set up mock implementation for login
    mockAuthService.login.mockImplementation((credentials) => {
      if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
        return Promise.resolve(Result.ok(mockTokenResponse));
      }
      return Promise.resolve(Result.fail(new Error('Invalid credentials')));
    });
  });

  // 1. Success scenario
  it('should return a token for valid credentials', async () => {
    const result = await useCase.execute({ email: 'test@example.com', password: 'password123' });

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).toEqual(mockTokenResponse);
    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // 2. Failure scenario
  it('should fail for invalid credentials', async () => {
    const result = await useCase.execute({ email: 'wrong@example.com', password: 'wrongpassword' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Invalid credentials');
  });

  // 3. Validation scenario
  it('should fail for invalid input', async () => {
    const result = await useCase.execute({ email: 'invalid-email', password: '123' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('email');
  });
});
