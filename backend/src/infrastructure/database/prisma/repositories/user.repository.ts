import { PrismaClient, UserRole } from '@prisma/client';
import { User } from '../../../../core/domain/user/user.entity';
import { IUserRepository } from '../../../../core/application/interfaces/repositories/user.repository';
import { BaseRepository } from '../base-repository';
import { UserMapper } from '../mappers/user.mapper';
import { Result } from '../../../../shared/result';
import { injectable } from 'inversify';

@injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.executeOperation<User | null>(async () => {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        return null;
      }

      return UserMapper.toDomain(user);
    });

    return result.isSuccess ? result.getValue() : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.executeOperation<User | null>(async () => {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      return UserMapper.toDomain(user);
    });

    return result.isSuccess ? result.getValue() : null;
  }

  async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    const result = await this.executeOperation<User[]>(async () => {
      const users = await this.prisma.user.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return users.map(user => UserMapper.toDomain(user));
    });

    return result.isSuccess ? result.getValue() : [];
  }

  async count(): Promise<number> {
    const result = await this.executeOperation<number>(async () => {
      return await this.prisma.user.count();
    });

    return result.isSuccess ? result.getValue() : 0;
  }

  async save(user: User): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      const userData = UserMapper.toPrisma(user);
      
      if (await this.prisma.user.findUnique({ where: { id: user.id } })) {
        // Update existing user
        await this.prisma.user.update({
          where: { id: user.id },
          data: userData,
        });
      } else {
        // Create new user - ensure required fields are present
        await this.prisma.user.create({
          data: {
            id: userData.id,
            email: userData.email!,
            password: userData.password!,
            name: userData.name || '',
            role: userData.role || UserRole.PLAYER,
            emailVerified: userData.emailVerified || false,
          },
        });
      }

      return undefined;
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }

  async update(user: User): Promise<void> {
    const result = await this.executeOperation(async () => {
      const userData = UserMapper.toPrisma(user);

      await this.prisma.user.update({
        where: { id: user.id },
        data: userData,
      });
      
      return Result.ok<void>(undefined);
    });
    
    if (result.isFailure) {
      throw result.getError();
    }
  }

  async delete(id: string): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      await this.prisma.user.delete({
        where: { id },
      });

      return undefined;
    });

    if (result.isFailure) {
      throw result.getError();
    }
  }
}
