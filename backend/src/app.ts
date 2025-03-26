import 'reflect-metadata'; // Required for inversify
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { container } from './config/di-container';
import { TYPES } from './config/di-container';
import { IAuthService } from './core/application/interfaces/auth-service.interface';
import apiRoutes from './api/routes/index';
import { diMiddleware } from './api/middlewares/di.middleware';
import { setupSwagger } from './config/swagger';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './shared/error-handler';
import { handleZodError, handlePrismaError, handleHttpError, finalErrorTransformer } from './api/middlewares/error.middleware';
import { requestIdMiddleware } from './api/middlewares/request-id.middleware';
import { logger } from './config/logger';

// Load environment variables
dotenv.config();

// Initialize application
const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Add request ID middleware - must be added before other middleware
app.use(requestIdMiddleware);

// Use morgan with custom format to include request ID
app.use(morgan(':method :url :status :response-time ms - :res[content-length]', {
  stream: {
    write: (message: string) => {
      // Skip logging in morgan, as we're already logging in the request ID middleware
      return true;
    }
  }
}));

// Inject container into request
app.use(diMiddleware);

// Setup Swagger
setupSwagger(app);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    // Get PrismaClient for database connection check
    const prisma = container.get(TYPES.PrismaClient) as PrismaClient;
    
    // Check database connection by executing a simple query
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({ 
      status: 'ok',
      uptime: process.uptime(),
      timestamp: Date.now(),
      database: {
        connected: true
      },
      memory: {
        rss: process.memoryUsage().rss,
        heapTotal: process.memoryUsage().heapTotal,
        heapUsed: process.memoryUsage().heapUsed
      },
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    logger.error('Health check error:', { error: error instanceof Error ? error.message : 'Unknown database error' });
    res.status(503).json({ 
      status: 'error',
      database: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown database error'
      }
    });
  }
});

// Error handling middleware chain
app.use(handleZodError);
app.use(handlePrismaError);
app.use(handleHttpError);
app.use(finalErrorTransformer);

// Global error handler (formats and sends the response)
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  // Create HTTP server
  const http = require('http');
  const server = http.createServer(app);

  // Store the server instance
  let currentServer = server;

  // Handle shutdown gracefully
  const gracefulShutdown = () => {
    logger.info('Received shutdown signal, closing server...');
    currentServer.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    
    // Force close after 10s if it doesn't close gracefully
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  // Listen for shutdown signals
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // Function to start server with port finding
  const startServer = (attemptPort = port, maxRetries = 5, attempt = 1) => {
    server.listen(attemptPort, () => {
      logger.info(`Server is running on port ${attemptPort}`);
      logger.info(`Swagger documentation available at http://localhost:${attemptPort}/api-docs`);
    });

    server.on('error', (e: NodeJS.ErrnoException) => {
      if (e.code === 'EADDRINUSE') {
        logger.warn(`Port ${attemptPort} is in use, trying another port...`);
        if (attempt <= maxRetries) {
          // Try next port
          const nextPort = parseInt(attemptPort.toString()) + 1;
          startServer(nextPort, maxRetries, attempt + 1);
        } else {
          logger.error(`Could not find an available port after ${maxRetries} attempts`);
        }
      } else {
        logger.error('Server error:', { error: e.message, stack: e.stack });
      }
    });
  };

  // Start the server
  startServer();
}

export default app;
