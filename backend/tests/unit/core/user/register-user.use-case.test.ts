import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { RegisterUserUseCase } from '../../../../src/core/application/use-cases/user/register-user.use-case';
import { IAuthService } from '../../../../src/core/application/interfaces/auth-service.interface';
import { Result } from '../../../../src/shared/result';

// Mock UserRepository
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    let result = [...this.users];
    if (offset !== undefined) {
      result = result.slice(offset);
    }
    if (limit !== undefined) {
      result = result.slice(0, limit);
    }
    return result;
  }

  async count(): Promise<number> {
    return this.users.length;
  }

  async save(user: User): Promise<void> {
    this.users.push(user);
  }

  async update(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
  }

  async delete(id: string): Promise<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

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
  deleteUser: jest.fn(),
};

// Test suite for RegisterUserUseCase
describe('RegisterUserUseCase', () => {
  let userRepository: IUserRepository;
  let registerUserUseCase: RegisterUserUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository();
    registerUserUseCase = new RegisterUserUseCase(userRepository, mockAuthService);
    
    // Setup the mock implementation for register method
    mockAuthService.register.mockImplementation((data) => {
      return Promise.resolve(
        Result.ok({
          accessToken: 'test-token',
          refreshToken: 'test-refresh-token',
          user: {
            id: 'new-user-id',
            email: data.email,
            name: data.name,
            role: data.role || 'PLAYER',
            emailVerified: false
          }
        })
      );
    });
  });

  it('should register a new user successfully', async () => {
    const input = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'PLAYER',
    };

    const result = await registerUserUseCase.execute(input);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue().email).toBe('test@example.com');
  });

  it('should not register a user with an existing email', async () => {
    const existingUser = new User(
      '1',
      'test@example.com',
      'password123',
      'Test User',
      UserRole.PLAYER,
    );
    await userRepository.save(existingUser);

    const input = {
      email: 'test@example.com',
      password: 'password456',
      name: 'New User',
      role: 'PLAYER',
    };

    const result = await registerUserUseCase.execute(input);

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Email already in use');
  });
});
