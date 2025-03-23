import { User as PrismaUser } from '@prisma/client';
import { User, UserRole } from '../../../../core/domain/user/user.entity';

export class UserMapper {
  /**
   * Maps a Prisma User model to a domain User entity
   */
  public static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.password,
      prismaUser.name,
      this.mapPrismaRoleToDomain(prismaUser.role),
      prismaUser.emailVerified,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  /**
   * Maps a domain User entity to a Prisma User create/update object
   */
  public static toPrisma(domainUser: User): Partial<PrismaUser> {
    return {
      id: domainUser.id,
      email: domainUser.email,
      password: domainUser.password,
      name: domainUser.name,
      role: this.mapDomainRoleToPrisma(domainUser.role),
      emailVerified: domainUser.emailVerified,
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt,
    };
  }

  /**
   * Maps a Prisma user role to a domain UserRole enum
   */
  public static mapPrismaRoleToDomain(role: PrismaUser['role']): UserRole {
    const roleMap: Record<string, UserRole> = {
      ADMIN: UserRole.ADMIN,
      PLAYER: UserRole.PLAYER,
    };

    return roleMap[role] || UserRole.PLAYER;
  }

  /**
   * Maps a domain UserRole enum to a Prisma user role
   */
  public static mapDomainRoleToPrisma(role: UserRole): PrismaUser['role'] {
    const roleMap: Record<UserRole, PrismaUser['role']> = {
      [UserRole.ADMIN]: 'ADMIN',
      [UserRole.PLAYER]: 'PLAYER',
    };

    return roleMap[role];
  }
}
