import winston from 'winston';
import { env } from './env';

// Definir formato de logs
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Crear logger
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'ligenia-api' },
  transports: [
    // Escribir logs de error y warn a error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // Escribir todos los logs a combined.log
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Si no estamos en producción, también loguear a la consola
if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export { logger }; 