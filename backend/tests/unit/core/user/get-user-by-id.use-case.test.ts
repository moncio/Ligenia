import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { GetUserByIdUseCase } from '../../../../src/core/application/use-cases/user/get-user-by-id.use-case';
import { Result } from '../../../../src/shared/result';

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

// Test suite for GetUserByIdUseCase
describe('GetUserByIdUseCase', () => {
  const testUser = new User(
    '123e4567-e89b-12d3-a456-426614174000',
    'test@example.com',
    'password123',
    'Test User',
    UserRole.PLAYER,
  );

  let userRepository: IUserRepository;
  let getUserByIdUseCase: GetUserByIdUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository([testUser]);
    getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  });

  // 1. Success scenario
  it('should get a user by ID successfully', async () => {
    const result = await getUserByIdUseCase.execute({ id: testUser.id });

    expect(result.isSuccess()).toBe(true);
    const user = result.getValue();
    expect(user).not.toBeNull();
    expect(user!.id).toBe(testUser.id);
    expect(user!.email).toBe(testUser.email);
    expect(user!.name).toBe(testUser.name);
  });

  // 2. Input validation scenario
  it('should fail when providing an invalid UUID format', async () => {
    const result = await getUserByIdUseCase.execute({ id: 'invalid-uuid' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toContain('Invalid user ID format');
  });

  // 3. Business logic failure - not found
  it('should fail when user is not found', async () => {
    const result = await getUserByIdUseCase.execute({ id: '00000000-0000-0000-0000-000000000000' });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('User not found');
  });

  // 4. Error handling with mocked repository
  it('should handle repository errors', async () => {
    const errorRepository = new ErrorThrowingUserRepository();
    const useCase = new GetUserByIdUseCase(errorRepository);
    
    const result = await useCase.execute({ id: testUser.id });

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Database error');
  });
}); 