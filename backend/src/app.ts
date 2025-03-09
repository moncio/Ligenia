import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, zodErrorHandler } from './api/middlewares/error.middleware';
import { setupRoutes } from './api/routes';

// Crear aplicación Express
const app = express();

// Middlewares
app.use(helmet()); // Seguridad
app.use(cors({ origin: env.CORS_ORIGIN })); // CORS
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Parseo de URL-encoded
app.use(morgan('dev')); // Logging de HTTP

// Ruta de salud
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', environment: env.NODE_ENV });
});

// Rutas de la API
app.use('/api/v1', setupRoutes());

// Middleware para convertir errores de Zod
app.use(zodErrorHandler);

// Middleware para manejo de errores
app.use(errorHandler);

// Middleware para rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
}

export default app; 