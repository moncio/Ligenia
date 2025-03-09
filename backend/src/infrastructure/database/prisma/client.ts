import { PrismaClient } from '@prisma/client';
import { logger } from '../../../config/logger';

// Crear una instancia global de PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Exportar una instancia única de PrismaClient
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

// Configurar eventos de logging
prisma.$on('query', e => {
  logger.debug(`Query: ${e.query}`);
  logger.debug(`Duration: ${e.duration}ms`);
});

prisma.$on('error', e => {
  logger.error(`Prisma Error: ${e.message}`);
});

prisma.$on('info', e => {
  logger.info(`Prisma Info: ${e.message}`);
});

prisma.$on('warn', e => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

// En entornos que no son de producción, registrar la instancia de Prisma globalmente
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 