import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger, logWithRequestId } from '../../config/logger';

/**
 * Request ID middleware
 * 
 * This middleware ensures each request has a unique identifier.
 * It either preserves an existing ID in the x-request-id header or generates a new UUID.
 * The ID is attached to the request object and added to the response headers.
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Get existing request ID or generate a new one
  const requestId = 
    (req.headers['x-request-id'] as string) || 
    (req.headers['x-correlation-id'] as string) || 
    uuidv4();
  
  // Attach the request ID to the request object for later use
  (req as any).id = requestId;
  
  // Add the request ID to response headers
  res.setHeader('x-request-id', requestId);
  
  // Log the request details 
  const reqLogger = logWithRequestId(req as any);
  
  // Log incoming request details in debug level (not logged in production)
  reqLogger.debug('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  
  // Capture response time and status code in response finish event
  const startTime = Date.now();
  
  // Add listener for when response is sent
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    
    // Log request completion with appropriate level based on status code
    reqLogger[logLevel]('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
}; 