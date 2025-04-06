import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { UpdateUserUseCase } from '../../../../src/core/application/use-cases/user/update-user.use-case';
import { Result } from '../../../../src/shared/result';
import { IAuthService } from '../../../../src/core/application/interfaces/auth-service.interface';

// Mock UserRepository
class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = initialUsers;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findAll(limit?: number, offset?: number): Promise<User[]> {
    return this.users.slice(offset || 0, (offset || 0) + (limit || this.users.length));
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

// Mock error throwing repository
class ErrorThrowingUserRepository implements IUserRepository {
  async findById(): Promise<User | null> {
    throw new Error('Database error');
  }

  async findByEmail(): Promise<User | null> {
    throw new Error('Database error');
  }

  async findAll(): Promise<User[]> {
    throw new Error('Database error');
  }

  async count(): Promise<number> {
    throw new Error('Database error');
  }

  async save(): Promise<void> {
    throw new Error('Database error');
  }

  async update(): Promise<void> {
    throw new Error('Database error');
  }

  async delete(): Promise<void> {
    throw new Error('Database error');
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

// Test suite for UpdateUserUseCase
describe('UpdateUserUseCase', () => {
  // Create test users
  const testUser = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'user@example.com',
    'password123',
    'Original Name',
    UserRole.PLAYER,
  );

  const anotherUser = new User(
    '123e4567-e89b-12d3-a456-426614174001',
    'another@example.com',
    'password123',
    'Another User',
    UserRole.PLAYER,
  );

  let userRepository: IUserRepository;
  let updateUserUseCase: UpdateUserUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository([testUser, anotherUser]);
    updateUserUseCase = new UpdateUserUseCase(userRepository, mockAuthService);

    // Configure mock for the authService.updateUser method
    mockAuthService.updateUser.mockImplementation((userId, data) => {
      return Promise.resolve(
        Result.ok({
          id: userId,
          email: data.email || testUser.email,
          name: data.name || testUser.name,
          role: data.role || testUser.role,
          emailVerified: true
        })
      );
    });
  });

  // 1. Success scenario - update name
  it('should update user name successfully', async () => {
    const newName = 'Updated Name';
    const result = await updateUserUseCase.execute({
      id: testUser.id,
      name: newName,
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = result.getValue();
    expect(updatedUser.name).toBe(newName);
    expect(updatedUser.email).toBe(testUser.email); // Email should not change
    expect(updatedUser.role).toBe(testUser.role); // Role should not change
  });

  // 2. Success scenario - update email
  it('should update user email successfully', async () => {
    const newEmail = 'new-email@example.com';
    const result = await updateUserUseCase.execute({
      id: testUser.id,
      email: newEmail,
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = result.getValue();
    expect(updatedUser.email).toBe(newEmail);
  });

  // 3. Success scenario - update role
  it('should update user role successfully', async () => {
    const result = await updateUserUseCase.execute({
      id: testUser.id,
      role: UserRole.ADMIN,
    });

    expect(result.isSuccess()).toBe(true);
    const updatedUser = result.getValue();
    expect(updatedUser.role).toBe(UserRole.ADMIN);
  });

  // 4. Input validation - invalid UUID
  it('should fail when ID is not a valid UUID', async () => {
    const result = await updateUserUseCase.execute({
      id: 'invalid-uuid',
      name: 'New Name',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid user ID format');
  });

  // 5. Input validation - invalid email
  it('should fail when email format is invalid', async () => {
    const result = await updateUserUseCase.execute({
      id: testUser.id,
      email: 'not-an-email',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid email format');
  });

  // 6. Input validation - invalid name
  it('should fail when name is too short', async () => {
    const result = await updateUserUseCase.execute({
      id: testUser.id,
      name: 'A', // Only 1 character
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Name must be at least 2 characters');
  });

  // 7. Business logic failure - user not found
  it('should fail when user is not found', async () => {
    const result = await updateUserUseCase.execute({
      id: '00000000-0000-0000-0000-000000000000', // Non-existent ID
      name: 'New Name',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('User not found');
  });

  // 8. Business logic failure - email already in use
  it('should fail when email is already in use by another user', async () => {
    const result = await updateUserUseCase.execute({
      id: testUser.id,
      email: anotherUser.email, // Email of another user
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Email is already in use');
  });

  // 9. Error handling with mocked repository
  it('should handle repository errors', async () => {
    const errorRepository = new ErrorThrowingUserRepository();
    const useCase = new UpdateUserUseCase(errorRepository, mockAuthService);
    
    const result = await useCase.execute({
      id: testUser.id,
      name: 'New Name',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Database error');
  });
}); 