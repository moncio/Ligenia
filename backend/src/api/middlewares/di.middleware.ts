import { Request, Response, NextFunction } from 'express';
import { Container } from 'inversify';
import { container } from '../../config/di-container';
import { mockContainer } from './auth.middleware';

/**
 * Extended request with DI container
 */
export interface ContainerRequest extends Request {
  container?: Container;
}

/**
 * Middleware function to inject dependency injection container into the request
 */
export const diMiddleware = (req: ContainerRequest, res: Response, next: NextFunction) => {
  try {
    // First check if we're in a test environment
    if (process.env.NODE_ENV === 'test') {
      // If mockContainer is available, use it
      if (mockContainer) {
        console.log('Setting request container to mockContainer in DI middleware');
        req.container = mockContainer;
        return next();
      }
      
      // req.container is already set by auth middleware if it's a test
      if (req.container) {
        return next();
      }
      // In test mode, default to app container if container is not set
      req.container = container;
      return next();
    }

    // In non-test mode, set app container
    req.container = container;
    next();
  } catch (error) {
    console.error('Error in DI middleware:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
}; 