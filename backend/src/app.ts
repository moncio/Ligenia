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
app.use(morgan('dev'));

// Inject container into request
app.use(diMiddleware);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
