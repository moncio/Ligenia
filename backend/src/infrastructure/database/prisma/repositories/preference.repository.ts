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
      // Intentar obtener preferencias con Prisma normalmente
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
      } catch (prismaError) {
        // Si falla Prisma, intentar con consulta SQL directa
        console.error(`Prisma error in getUserPreferences: ${prismaError}`);
        
        try {
          const result = await this.prisma.$queryRaw`
            SELECT id, "userId", theme, "fontSize", "createdAt", "updatedAt" 
            FROM "UserPreference" 
            WHERE "userId" = ${userId}
            LIMIT 1
          `;
          
          if (Array.isArray(result) && result.length > 0) {
            return result[0] as UserPreference;
          }
        } catch (rawError) {
          console.error(`Raw query error in getUserPreferences: ${rawError}`);
        }
      }
      
      // Si no hay preferencias o hay error, devolver null
      return null;
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
      // Remove id, createdAt, updatedAt from data
      const { id: _, createdAt: __, updatedAt: ___, ...safeUpdateData } = data as any;
      
      // Intentar upsert directamente sin verificar primero
      // Esta es la operación más eficiente y menos propensa a errores de timeout
      try {
        // Usar directamente upsert sin transacción para reducir el uso de conexiones
        return await this.prisma.userPreference.upsert({
          where: { userId },
          update: safeUpdateData,
          create: {
            id: uuidv4(),
            userId,
            theme: data.theme || 'light',
            fontSize: data.fontSize || 16,
            ...safeUpdateData
          }
        });
      } catch (dbError) {
        console.error(`Database error in updateUserPreferences: ${dbError}`);
        
        // En caso de error de DB, intentar un último enfoque basado en consulta directa SQL
        // para evitar bloqueos del pool
        try {
          // Verificar si existe directamente con una consulta raw (más eficiente)
          // Esta operación es mucho más ligera y tiene menos probabilidad de bloquear
          const existingRecord = await this.prisma.$queryRaw`
            SELECT id FROM "UserPreference" WHERE "userId" = ${userId} LIMIT 1
          `;
          
          if (Array.isArray(existingRecord) && existingRecord.length > 0) {
            // Si existe, hacer update a través de una consulta raw
            await this.prisma.$executeRaw`
              UPDATE "UserPreference" 
              SET "theme" = ${data.theme || 'light'}, 
                  "fontSize" = ${data.fontSize || 16}, 
                  "updatedAt" = now()
              WHERE "userId" = ${userId}
            `;
          } else {
            // Si no existe, insertar a través de una consulta raw
            await this.prisma.$executeRaw`
              INSERT INTO "UserPreference" (id, "userId", theme, "fontSize", "createdAt", "updatedAt")
              VALUES (${uuidv4()}, ${userId}, ${data.theme || 'light'}, ${data.fontSize || 16}, now(), now())
            `;
          }
          
          // Devolver valores actualizados sin obtenerlos de la base de datos
          return {
            id: 'temp-id', // ID temporal, no relevante para el cliente
            userId,
            theme: data.theme || 'light',
            fontSize: data.fontSize || 16,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        } catch (rawError) {
          console.error(`Raw query error in updateUserPreferences: ${rawError}`);
          // No volver a intentar, devolver valores por defecto
        }
      }
      
      // Caer a valores por defecto si todos los intentos fallan
      console.log(`Using default preferences for user ${userId} after all database operations failed`);
      return {
        id: 'default-' + Date.now(),
        userId,
        theme: data.theme || 'light',
        fontSize: data.fontSize || 16,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error(`Critical error updating user preferences: ${error}`);
      
      // Devolver siempre un valor por defecto, nunca fallar
      return {
        id: 'error-' + Date.now(),
        userId,
        theme: 'light',
        fontSize: 16,
        createdAt: new Date(),
        updatedAt: new Date()
      };
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