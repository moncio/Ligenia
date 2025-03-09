import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';
import { env } from '../../config/env';
import { ZodError } from 'zod';

/**
 * Clase base para errores de la API
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error para recursos no encontrados
 */
export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(404, message, true);
  }
}

/**
 * Error para solicitudes incorrectas
 */
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(400, message, true);
  }
}

/**
 * Error para acceso no autorizado
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message, true);
  }
}

/**
 * Error para acceso prohibido
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message, true);
  }
}

/**
 * Error para conflictos
 */
export class ConflictError extends ApiError {
  constructor(message = 'Conflict') {
    super(409, message, true);
  }
}

/**
 * Middleware para convertir errores de Zod en errores de API
 */
export const zodErrorHandler = (err: Error, _req: Request, _res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(error => ({
      path: error.path.join('.'),
      message: error.message,
    }));
    
    return next(new BadRequestError(`Validation error: ${JSON.stringify(formattedErrors)}`));
  }
  
  return next(err);
};

/**
 * Middleware para manejar errores de la API
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ApiError) {
    // Error operacional, enviar respuesta con el código de estado y mensaje
    logger.warn(`API Error: ${err.message}`);
    
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  // Error no operacional, registrar y enviar error genérico
  logger.error(`Unhandled Error: ${err.message}`, { stack: err.stack });
  
  return res.status(500).json({
    status: 'error',
    message: env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}; 