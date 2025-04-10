import { PrismaClient, UserRole } from '@prisma/client';
import { User } from '../../../../core/domain/user/user.entity';
import { IUserRepository } from '../../../../core/application/interfaces/repositories/user.repository';
import { BaseRepository } from '../base-repository';
import { UserMapper } from '../mappers/user.mapper';
import { Result } from '../../../../shared/result';
import { injectable } from 'inversify';
import { logger } from '../../../../config/logger';

@injectable()
export class UserRepository extends BaseRepository implements IUserRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma);
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

    return result.isSuccess() ? result.getValue() : null;
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

    return result.isSuccess() ? result.getValue() : null;
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

    return result.isSuccess() ? result.getValue() : [];
  }

  async count(): Promise<number> {
    const result = await this.executeOperation<number>(async () => {
      return await this.prisma.user.count();
    });

    return result.isSuccess() ? result.getValue() : 0;
  }

  async save(user: User): Promise<void> {
    logger.info(`UserRepository.save called with user ID: ${user.id}`);
    
    const result = await this.executeOperation<void>(async () => {
      logger.info(`Converting domain user to Prisma model`);
      const userData = UserMapper.toPrisma(user);
      logger.info(`User data after mapping: ${JSON.stringify(userData)}`);
      
      try {
        const existingUser = await this.prisma.user.findUnique({ where: { id: user.id } });
        logger.info(`Existing user check result: ${existingUser ? 'User exists' : 'User does not exist'}`);
        
        if (existingUser) {
          // Update existing user
          logger.info(`Updating existing user with ID: ${user.id}`);
          try {
            await this.prisma.user.update({
              where: { id: user.id },
              data: userData,
            });
            logger.info(`User updated successfully: ${user.id}`);
          } catch (updateError) {
            logger.error(`Error updating user: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
            throw updateError;
          }
        } else {
          // Create new user - ensure required fields are present
          logger.info(`Creating new user with ID: ${user.id}`);
          try {
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
            logger.info(`User created successfully: ${user.id}`);
          } catch (createError) {
            logger.error(`Error creating user: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
            if (createError instanceof Error && createError.name === 'PrismaClientKnownRequestError') {
              const prismaError = createError as any;
              logger.error(`Prisma error code: ${prismaError.code}, meta: ${JSON.stringify(prismaError.meta)}`);
            }
            throw createError;
          }
        }
      } catch (error) {
        logger.error(`Error checking for existing user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      }

      return undefined;
    });

    if (result.isFailure()) {
      logger.error(`UserRepository.save failed: ${result.getError().message}`);
      throw result.getError();
    }
    
    logger.info(`UserRepository.save completed successfully for user: ${user.id}`);
  }

  async update(user: User): Promise<void> {
    const result = await this.executeOperation<void>(async () => {
      const userData = UserMapper.toPrisma(user);

      await this.prisma.user.update({
        where: { id: user.id },
        data: userData,
      });
      
      return undefined;
    });
    
    if (result.isFailure()) {
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

    if (result.isFailure()) {
      throw result.getError();
    }
  }
}
