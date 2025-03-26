import { UserPreference, PrismaClient } from '@prisma/client';
import { IPreferenceRepository } from '../../../../core/application/interfaces/repositories/preference.repository';
import { BaseRepository } from '../base-repository';
import { PreferenceMapper } from '../mappers/preference.mapper';
import { Result } from '../../../../shared/result';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

@injectable()
export class PreferenceRepository extends BaseRepository implements IPreferenceRepository {
  constructor(protected readonly prisma: PrismaClient) {
    super(prisma);
  }

  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    try {
      const preference = await this.prisma.userPreference.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          theme: true,
          fontSize: true,
          createdAt: true,
          updatedAt: true,
        }
      });

      return preference;
    } catch (error) {
      console.error(`Error getting user preferences: ${error}`);
      return null;
    }
  }

  async updateUserPreferences(
    userId: string,
    data: Partial<UserPreference>
  ): Promise<UserPreference> {
    try {
      // Check if preferences exist
      const existingPreference = await this.prisma.userPreference.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
          theme: true,
          fontSize: true,
        }
      });

      // Remove id, createdAt, updatedAt from data
      const { id: _, createdAt: __, updatedAt: ___, ...safeUpdateData } = data as any;

      if (existingPreference) {
        // Update existing preference
        return await this.prisma.userPreference.update({
          where: { userId },
          data: safeUpdateData,
        });
      } else {
        // Create new preference with default values plus provided updates
        return await this.prisma.userPreference.create({
          data: {
            id: uuidv4(),
            userId,
            theme: data.theme || 'light',
            fontSize: data.fontSize || 16,
          },
        });
      }
    } catch (error) {
      console.error(`Error updating user preferences: ${error}`);
      throw error;
    }
  }

  async resetUserPreferences(userId: string): Promise<UserPreference> {
    try {
      // Check if preferences exist
      const existingPreference = await this.prisma.userPreference.findUnique({
        where: { userId },
        select: {
          id: true,
          userId: true,
        }
      });

      if (existingPreference) {
        // Reset existing preference to default values
        return await this.prisma.userPreference.update({
          where: { userId },
          data: {
            theme: 'light',
            fontSize: 16,
          },
        });
      } else {
        // Create new preference with default values
        return await this.prisma.userPreference.create({
          data: {
            id: uuidv4(),
            userId,
            theme: 'light',
            fontSize: 16,
          },
        });
      }
    } catch (error) {
      console.error(`Error resetting user preferences: ${error}`);
      throw error;
    }
  }
} 