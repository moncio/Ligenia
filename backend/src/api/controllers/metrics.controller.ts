import { Request, Response, NextFunction } from 'express';
import { container } from '../../config/di-container';
import { TYPES } from '../../config/di-container';
import { PrismaClient } from '@prisma/client';
import os from 'os';
import { logWithRequestId } from '../../config/logger';

/**
 * Controller for system metrics
 */
export class MetricsController {
  /**
   * Get system metrics about the application
   */
  public getSystemMetrics = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const log = logWithRequestId(req);
    
    try {
      // Get PrismaClient for database connection info
      const prisma = container.get(TYPES.PrismaClient) as PrismaClient;
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      
      // Get CPU info
      const cpuUsage = process.cpuUsage();
      const loadAvg = os.loadavg();
      const cpuCount = os.cpus().length;
      
      // Calculate uptime
      const uptime = {
        seconds: process.uptime(),
        formatted: this.formatUptime(process.uptime())
      };
      
      // Get database metrics
      // Note: Prisma doesn't expose connection pool metrics directly
      // This is a best-effort approximation by running a query
      let dbConnections = null;
      let dbConnected = false;
      
      try {
        // Check database connection by executing a simple query
        await prisma.$queryRaw`SELECT 1`;
        dbConnected = true;
        
        // Try to get connection count (PostgreSQL specific)
        // This will only work if using PostgreSQL and if the user has permissions
        const connections = await prisma.$queryRaw<Array<{ active_connections: number }>>`
          SELECT count(*) as active_connections 
          FROM pg_stat_activity 
          WHERE datname = current_database()
        `;
        dbConnections = connections[0]?.active_connections || 'Unknown';
      } catch (error) {
        log.error('Error getting database metrics', { 
          error: error instanceof Error ? error.message : 'Unknown error', 
          stack: error instanceof Error ? error.stack : undefined 
        });
      }
      
      // Compile response
      const metrics = {
        timestamp: Date.now(),
        environment: process.env.NODE_ENV || 'development',
        memory: {
          rss: {
            bytes: memoryUsage.rss,
            megabytes: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100
          },
          heapTotal: {
            bytes: memoryUsage.heapTotal,
            megabytes: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100
          },
          heapUsed: {
            bytes: memoryUsage.heapUsed,
            megabytes: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100
          },
          external: {
            bytes: memoryUsage.external,
            megabytes: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100
          },
          arrayBuffers: {
            bytes: memoryUsage.arrayBuffers,
            megabytes: Math.round(memoryUsage.arrayBuffers / 1024 / 1024 * 100) / 100
          }
        },
        cpu: {
          usage: cpuUsage,
          loadAverage: loadAvg,
          cores: cpuCount,
          utilization: {
            '1min': Math.round((loadAvg[0] / cpuCount) * 100) / 100,
            '5min': Math.round((loadAvg[1] / cpuCount) * 100) / 100,
            '15min': Math.round((loadAvg[2] / cpuCount) * 100) / 100
          }
        },
        uptime,
        database: {
          connected: dbConnected,
          activeConnections: dbConnections
        },
        process: {
          pid: process.pid,
          version: process.version,
          title: process.title
        }
      };
      
      log.info('System metrics retrieved successfully', { 
        connected: dbConnected,
        uptimeSeconds: uptime.seconds
      });
      
      res.status(200).json({
        status: 'success',
        data: metrics
      });
      
    } catch (error) {
      log.error('Error retrieving system metrics', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      next(error);
    }
  };
  
  /**
   * Format uptime in a human-readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${remainingSeconds}s`;
  }
} 