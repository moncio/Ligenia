import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorType, handleUnknownError } from '../../shared/error-handler';
import { z } from 'zod';

/**
 * Middleware to catch async route errors
 * 
 * Example usage:
 * router.get('/users', catchAsync(async (req, res) => {
 *   // Your code here
 * }));
 */
export const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Middleware to transform Zod validation errors into AppErrors
 */
export const handleZodError = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof z.ZodError) {
    const validationError = new AppError(
      'Validation error',
      ErrorType.VALIDATION,
      400,
      true,
      error,
      { errors: error.errors }
    );
    
    next(validationError);
    return;
  }
  
  next(error);
};

/**
 * Middleware to transform Prisma errors into AppErrors
 */
export const handlePrismaError = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
  // Check if it's a Prisma error (has code property and name starting with 'Prisma')
  if (error && typeof error === 'object' && 'code' in error && 'name' in error) {
    const prismaError = error as { code: string; meta?: any; message: string; name: string };
    
    if (prismaError.name.startsWith('Prisma')) {
      let appError: AppError;
      
      // Handle common Prisma error codes
      switch (prismaError.code) {
        case 'P2002': // Unique constraint violation
          appError = new AppError(
            'A record with this identifier already exists',
            ErrorType.CONFLICT,
            409,
            true,
            error,
            { fields: prismaError.meta?.target }
          );
          break;
          
        case 'P2025': // Record not found
          appError = new AppError(
            'Record not found',
            ErrorType.NOT_FOUND,
            404,
            true,
            error
          );
          break;
          
        case 'P2003': // Foreign key constraint violation
          appError = new AppError(
            'Operation failed due to a reference constraint',
            ErrorType.BAD_REQUEST,
            400,
            true,
            error,
            { field: prismaError.meta?.field_name }
          );
          break;
          
        default:
          appError = new AppError(
            'Database operation failed',
            ErrorType.INTERNAL,
            500,
            false,
            error
          );
      }
      
      next(appError);
      return;
    }
  }
  
  next(error);
};

/**
 * Middleware to handle common HTTP errors
 */
export const handleHttpError = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
  // Already an AppError, pass it through
  if (error instanceof AppError) {
    next(error);
    return;
  }
  
  // Handle standard HTTP errors
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const httpError = error as { statusCode: number; message: string };
    
    let type: ErrorType;
    switch (httpError.statusCode) {
      case 400: type = ErrorType.BAD_REQUEST; break;
      case 401: type = ErrorType.UNAUTHORIZED; break;
      case 403: type = ErrorType.FORBIDDEN; break;
      case 404: type = ErrorType.NOT_FOUND; break;
      case 409: type = ErrorType.CONFLICT; break;
      default: type = ErrorType.INTERNAL;
    }
    
    const appError = new AppError(
      httpError.message || 'HTTP error',
      type,
      httpError.statusCode,
      httpError.statusCode < 500, // Only server errors are non-operational
      error
    );
    
    next(appError);
    return;
  }
  
  // For other errors, just pass them through
  next(error);
};

/**
 * Middleware to transform all unknown errors into AppErrors
 * This should be used LAST in the middleware chain
 */
export const finalErrorTransformer = (error: unknown, req: Request, res: Response, next: NextFunction): void => {
  // If it's not already an AppError, convert it
  if (!(error instanceof AppError)) {
    error = handleUnknownError(error, { path: req.path, method: req.method });
  }
  
  next(error);
}; 