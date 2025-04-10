import { PrismaClient } from '@prisma/client';
import { User, UserRole } from '../../../src/core/domain/user/user.entity';
import { UserRepository } from '../../../src/infrastructure/database/prisma/repositories/user.repository';
import { v4 as uuidv4 } from 'uuid';

describe('UserRepository Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: UserRepository;
  let testUsers: User[] = [];

  beforeAll(async () => {
    prisma = new PrismaClient();
    repository = new UserRepository(prisma);

    // Create test users
    testUsers = [
      new User(
        uuidv4(),
        'user1@example.com',
        'password123',
        'Test User 1',
        UserRole.PLAYER,
        false,
        new Date(),
        new Date(),
      ),
      new User(
        uuidv4(),
        'user2@example.com',
        'password123',
        'Test User 2',
        UserRole.ADMIN,
        true,
        new Date(),
        new Date(),
      ),
      new User(
        uuidv4(),
        'user3@example.com',
        'password123',
        'Test User 3',
        UserRole.PLAYER,
        false,
        new Date(),
        new Date(),
      ),
    ];
  });

  afterAll(async () => {
    // Clean up test data
    for (const user of testUsers) {
      try {
        await prisma.user.delete({
          where: { id: user.id },
        });
      } catch (error) {
        // Ignore errors if user doesn't exist
      }
    }

    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean users before each test
    try {
      await prisma.user.deleteMany({
        where: { 
          email: { 
            in: testUsers.map(u => u.email) 
          } 
        },
      });
    } catch (error) {
      // Ignore errors
    }
  });

  describe('save', () => {
    it('should save a new user', async () => {
      // Act
      await repository.save(testUsers[0]);

      // Assert
      const savedUser = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      
      expect(savedUser).not.toBeNull();
      expect(savedUser?.id).toBe(testUsers[0].id);
      expect(savedUser?.email).toBe(testUsers[0].email);
      expect(savedUser?.name).toBe(testUsers[0].name);
      expect(savedUser?.role).toBe('PLAYER');
    });

    it('should update an existing user', async () => {
      // Arrange
      await repository.save(testUsers[0]);

      const updatedUser = new User(
        testUsers[0].id,
        testUsers[0].email,
        testUsers[0].password,
        'Updated Name',
        UserRole.ADMIN,
        true,
        testUsers[0].createdAt,
        new Date(),
      );

      // Act
      await repository.save(updatedUser);

      // Assert
      const savedUser = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      
      expect(savedUser).not.toBeNull();
      expect(savedUser?.name).toBe('Updated Name');
      expect(savedUser?.role).toBe('ADMIN');
      expect(savedUser?.emailVerified).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      // Arrange
      await repository.save(testUsers[0]);

      // Act
      const user = await repository.findById(testUsers[0].id);

      // Assert
      expect(user).not.toBeNull();
      expect(user?.id).toBe(testUsers[0].id);
      expect(user?.email).toBe(testUsers[0].email);
      expect(user?.role).toBe(UserRole.PLAYER);
    });

    it('should return null when user not found', async () => {
      // Act
      const user = await repository.findById('non-existent-id');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      // Arrange
      await repository.save(testUsers[0]);

      // Act
      const user = await repository.findByEmail(testUsers[0].email);

      // Assert
      expect(user).not.toBeNull();
      expect(user?.id).toBe(testUsers[0].id);
      expect(user?.email).toBe(testUsers[0].email);
    });

    it('should return null when user not found by email', async () => {
      // Act
      const user = await repository.findByEmail('non-existent@example.com');

      // Assert
      expect(user).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      // Arrange
      await repository.save(testUsers[0]);

      const updatedUser = new User(
        testUsers[0].id,
        testUsers[0].email,
        testUsers[0].password,
        'Updated via Update Method',
        UserRole.ADMIN,
        true,
        testUsers[0].createdAt,
        new Date(),
      );

      // Act
      await repository.update(updatedUser);

      // Assert
      const savedUser = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      
      expect(savedUser).not.toBeNull();
      expect(savedUser?.name).toBe('Updated via Update Method');
      expect(savedUser?.role).toBe('ADMIN');
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      // Arrange
      await repository.save(testUsers[0]);
      
      // Act
      await repository.delete(testUsers[0].id);

      // Assert
      const deletedUser = await prisma.user.findUnique({
        where: { id: testUsers[0].id },
      });
      
      expect(deletedUser).toBeNull();
    });
  });
});
