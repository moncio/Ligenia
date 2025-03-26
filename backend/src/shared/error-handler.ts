import { Request, Response, NextFunction } from 'express';
import { logger, logWithRequestId } from '../config/logger';

// Define standard error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  INTERNAL = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST'
}

// Define enhanced error structure
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly httpCode: number;
  public readonly isOperational: boolean;
  public readonly cause?: Error | unknown;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    type: ErrorType = ErrorType.INTERNAL,
    httpCode: number = 500,
    isOperational: boolean = true,
    cause?: Error | unknown,
    context?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.type = type;
    this.httpCode = httpCode;
    this.isOperational = isOperational;
    this.cause = cause;
    this.context = context;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Factory methods for common errors
export const createNotFoundError = (message: string = 'Resource not found', context?: Record<string, unknown>) => {
  return new AppError(message, ErrorType.NOT_FOUND, 404, true, undefined, context);
};

export const createValidationError = (message: string = 'Invalid input data', context?: Record<string, unknown>) => {
  return new AppError(message, ErrorType.VALIDATION, 400, true, undefined, context);
};

export const createUnauthorizedError = (message: string = 'Unauthorized access', context?: Record<string, unknown>) => {
  return new AppError(message, ErrorType.UNAUTHORIZED, 401, true, undefined, context);
};

export const createForbiddenError = (message: string = 'Access forbidden', context?: Record<string, unknown>) => {
  return new AppError(message, ErrorType.FORBIDDEN, 403, true, undefined, context);
};

export const createConflictError = (message: string = 'Resource conflict', context?: Record<string, unknown>) => {
  return new AppError(message, ErrorType.CONFLICT, 409, true, undefined, context);
};

export const createInternalError = (
  message: string = 'Internal server error',
  cause?: Error | unknown,
  context?: Record<string, unknown>
) => {
  return new AppError(message, ErrorType.INTERNAL, 500, false, cause, context);
};

export const createBadRequestError = (message: string = 'Bad request', context?: Record<string, unknown>) => {
  return new AppError(message, ErrorType.BAD_REQUEST, 400, true, undefined, context);
};

// Format error for response based on environment
export const formatErrorResponse = (err: AppError | Error, req: Request): Record<string, unknown> => {
  const isDev = process.env.NODE_ENV === 'development';
  
  // Handle AppError instances
  if (err instanceof AppError) {
    // For development: provide detailed information
    if (isDev) {
      return {
        status: 'error',
        type: err.type,
        code: err.httpCode,
        message: err.message,
        stack: err.stack,
        cause: err.cause instanceof Error ? {
          message: err.cause.message,
          stack: err.cause.stack
        } : err.cause,
        context: err.context,
        isOperational: err.isOperational,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      };
    }
    
    // For production: limited information based on operational status
    if (err.isOperational) {
      // Safe to show to end users
      return {
        status: 'error',
        code: err.httpCode,
        message: err.message
      };
    } else {
      // Internal errors - hide details in production
      return {
        status: 'error',
        code: 500,
        message: 'An unexpected error occurred. Please try again later.'
      };
    }
  }
  
  // Handle regular Error instances
  if (isDev) {
    return {
      status: 'error',
      type: ErrorType.INTERNAL,
      code: 500,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    };
  }
  
  // Production - regular errors
  return {
    status: 'error',
    code: 500,
    message: 'An unexpected error occurred. Please try again later.'
  };
};

// Global error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const log = logWithRequestId(req);
  
  // Determine log level based on status code and error type
  const getLogLevel = () => {
    if (err instanceof AppError) {
      if (err.httpCode >= 500) return 'error';
      if (err.httpCode >= 400) return 'warn';
      return 'info';
    }
    return 'error'; // Default to error for unknown error types
  };
  
  const logLevel = getLogLevel();
  const errorInfo = {
    path: req.path,
    method: req.method,
    stack: err.stack,
    errorType: err instanceof AppError ? err.type : 'UNKNOWN',
    statusCode: err instanceof AppError ? err.httpCode : 500,
    isOperational: err instanceof AppError ? err.isOperational : false,
    context: err instanceof AppError ? err.context : undefined,
    cause: err instanceof AppError && err.cause instanceof Error ? err.cause.message : undefined
  };
  
  // Log the error with appropriate level and request ID
  log[logLevel](`Error caught by global handler: ${err.message}`, errorInfo);
  
  const statusCode = err instanceof AppError ? err.httpCode : 500;
  const errorResponse = formatErrorResponse(err, req);
  
  res.status(statusCode).json(errorResponse);
};

// Convert unknown errors to AppError
export const handleUnknownError = (error: unknown, context?: Record<string, unknown>): AppError => {
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    logger.error(`Unknown error converted to AppError: ${error.message}`, {
      stack: error.stack,
      context
    });
    return createInternalError(error.message, error, context);
  }
  
  logger.error('Unknown non-Error object converted to AppError', {
    error,
    context
  });
  return createInternalError('An unknown error occurred', error, context);
}; 