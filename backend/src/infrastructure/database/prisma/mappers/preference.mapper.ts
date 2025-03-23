import { UserPreference as PrismaUserPreference } from '@prisma/client';

export class PreferenceMapper {
  /**
   * Maps a Prisma UserPreference model directly as it is the domain entity
   * In this case, we're using the Prisma model as the domain entity
   */
  public static toDomain(prismaPreference: PrismaUserPreference): PrismaUserPreference {
    return {
      ...prismaPreference,
    };
  }

  /**
   * Maps a domain UserPreference entity to a Prisma UserPreference object for create/update
   */
  public static toPrisma(preference: PrismaUserPreference): Partial<PrismaUserPreference> {
    return {
      id: preference.id,
      userId: preference.userId,
      theme: preference.theme,
      fontSize: preference.fontSize,
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt,
    };
  }
} 