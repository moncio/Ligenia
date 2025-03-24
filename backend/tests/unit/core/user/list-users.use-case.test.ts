import { User, UserRole } from '../../../../src/core/domain/user/user.entity';
import { IUserRepository } from '../../../../src/core/application/interfaces/repositories/user.repository';
import { ListUsersUseCase } from '../../../../src/core/application/use-cases/user/list-users.use-case';

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

// Test suite for ListUsersUseCase
describe('ListUsersUseCase', () => {
  // Create test users
  const testUsers = [
    new User('1', 'user1@example.com', 'password1', 'User 1', UserRole.PLAYER),
    new User('2', 'user2@example.com', 'password2', 'User 2', UserRole.PLAYER),
    new User('3', 'admin@example.com', 'password3', 'Admin', UserRole.ADMIN),
    new User('4', 'user3@example.com', 'password4', 'User 3', UserRole.PLAYER),
    new User('5', 'user4@example.com', 'password5', 'User 4', UserRole.PLAYER),
  ];

  let userRepository: IUserRepository;
  let listUsersUseCase: ListUsersUseCase;

  beforeEach(() => {
    userRepository = new MockUserRepository(testUsers);
    listUsersUseCase = new ListUsersUseCase(userRepository);
  });

  // 1. Success scenario
  it('should list all users successfully', async () => {
    const result = await listUsersUseCase.execute({});

    expect(result.isSuccess()).toBe(true);
    const output = result.getValue();
    expect(output.users).toHaveLength(testUsers.length);
    expect(output.total).toBe(testUsers.length);
    // Default pagination values should be applied
    expect(output.limit).toBe(10);
    expect(output.offset).toBe(0);
  });

  // 2. Pagination scenario
  it('should apply pagination correctly', async () => {
    const limit = 2;
    const offset = 1;
    const result = await listUsersUseCase.execute({ limit, offset });

    expect(result.isSuccess()).toBe(true);
    const output = result.getValue();
    expect(output.users).toHaveLength(limit);
    expect(output.total).toBe(testUsers.length);
    expect(output.limit).toBe(limit);
    expect(output.offset).toBe(offset);
    // Check that the correct slice of users is returned
    expect(output.users[0].id).toBe(testUsers[offset].id);
    expect(output.users[1].id).toBe(testUsers[offset + 1].id);
  });

  // 3. Edge case with offset beyond available data
  it('should return empty array when offset is beyond available data', async () => {
    const result = await listUsersUseCase.execute({ offset: 10 });

    expect(result.isSuccess()).toBe(true);
    const output = result.getValue();
    expect(output.users).toHaveLength(0);
    expect(output.total).toBe(testUsers.length);
  });

  // 4. Error handling with mocked repository
  it('should handle repository errors', async () => {
    const errorRepository = new ErrorThrowingUserRepository();
    const useCase = new ListUsersUseCase(errorRepository);
    
    const result = await useCase.execute({});

    expect(result.isFailure()).toBe(true);
    expect(result.getError().message).toBe('Database error');
  });
}); 