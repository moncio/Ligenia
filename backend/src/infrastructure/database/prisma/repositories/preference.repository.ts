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
    super();
  }

  async getUserPreferences(userId: string): Promise<UserPreference | null> {
    const result = await this.executeOperation<UserPreference | null>(async () => {
      const preference = await this.prisma.userPreference.findUnique({
        where: { userId }
      });

      if (!preference) {
        return null;
      }

      return PreferenceMapper.toDomain(preference);
    });

    return result.isSuccess ? result.getValue() : null;
  }

  async updateUserPreferences(
    userId: string,
    data: Partial<UserPreference>
  ): Promise<UserPreference> {
    const result = await this.executeOperation<UserPreference>(async () => {
      // Check if preferences exist
      const existingPreference = await this.prisma.userPreference.findUnique({
        where: { userId }
      });

      // Remove id, createdAt, and updatedAt from data to prevent overwriting
      const { id: _, createdAt: __, updatedAt: ___, ...updateData } = data as any;

      if (existingPreference) {
        // Update existing preference
        const updatedPreference = await this.prisma.userPreference.update({
          where: { userId },
          data: updateData
        });

        return PreferenceMapper.toDomain(updatedPreference);
      } else {
        // Create new preference with default values plus provided updates
        const newPreference = await this.prisma.userPreference.create({
          data: {
            id: uuidv4(),
            userId,
            theme: 'system',
            fontSize: 16,
            ...updateData
          }
        });

        return PreferenceMapper.toDomain(newPreference);
      }
    });

    if (result.isFailure) {
      throw result.getError();
    }

    return result.getValue();
  }

  async resetUserPreferences(userId: string): Promise<UserPreference> {
    const result = await this.executeOperation<UserPreference>(async () => {
      // Check if preferences exist
      const existingPreference = await this.prisma.userPreference.findUnique({
        where: { userId }
      });

      if (existingPreference) {
        // Reset existing preference to default values
        const resetPreference = await this.prisma.userPreference.update({
          where: { userId },
          data: {
            theme: 'system',
            fontSize: 16
          }
        });

        return PreferenceMapper.toDomain(resetPreference);
      } else {
        // Create new preference with default values
        const newPreference = await this.prisma.userPreference.create({
          data: {
            id: uuidv4(),
            userId,
            theme: 'system',
            fontSize: 16
          }
        });

        return PreferenceMapper.toDomain(newPreference);
      }
    });

    if (result.isFailure) {
      throw result.getError();
    }

    return result.getValue();
  }
} 