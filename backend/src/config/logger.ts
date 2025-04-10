import winston from 'winston';
import 'winston-daily-rotate-file';
import { env } from './env';
import { Request } from 'express';

// Sensitive data patterns to redact from logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'authorization',
  'apiKey',
  'api_key',
  'key',
  'jwt',
  'authentication',
  'refresh_token',
  'refreshToken',
  'authToken',
  'auth_token',
  'creditCard',
  'credit_card',
  'ssn',
  'socialSecurity'
];

// Redact sensitive information from logs if enabled in environment
const redactSensitiveInfo = (info: any): any => {
  // Skip redaction if disabled
  if (!env.LOG_REDACT_SENSITIVE) {
    return info;
  }
  
  const sanitized = { ...info };
  
  const redact = (obj: Record<string, any>, path = ''): void => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      const currentPath = path ? `${path}.${key}` : key;
      
      // Check if current key matches any sensitive pattern
      const isSensitive = SENSITIVE_FIELDS.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );
      
      if (isSensitive && obj[key]) {
        // Redact the sensitive value
        obj[key] = typeof obj[key] === 'string' ? '[REDACTED]' : '[REDACTED_DATA]';
      } else if (obj[key] && typeof obj[key] === 'object') {
        // Recursively check nested objects
        redact(obj[key], currentPath);
      }
    });
  };
  
  redact(sanitized);
  return sanitized;
};

// Create a custom format for redacting sensitive info
const redactionFormat = winston.format((info) => {
  return redactSensitiveInfo(info);
});

// Configure log format based on environment setting
const getLogFormat = () => {
  const baseFormats = [
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    redactionFormat(),
  ];
  
  switch (env.LOG_FORMAT) {
    case 'simple':
      return winston.format.combine(
        ...baseFormats,
        winston.format.simple()
      );
    case 'colorized':
      return winston.format.combine(
        ...baseFormats,
        winston.format.colorize(),
        winston.format.simple()
      );
    case 'json':
    default:
      return winston.format.combine(
        ...baseFormats,
        winston.format.json()
      );
  }
};

// Configure log levels based on environment
const getLogLevel = (): string => {
  switch (env.NODE_ENV) {
    case 'production':
      return env.LOG_LEVEL || 'info';
    case 'test':
      return env.LOG_LEVEL || 'error';
    default:
      return env.LOG_LEVEL || 'debug';
  }
};

// Create transports array based on configuration
const createTransports = () => {
  const transports: winston.transport[] = [];
  
  // Add file logging if enabled
  if (env.LOG_TO_FILE) {
    if (env.LOG_ROTATION) {
      // Add rotating file transports
      const errorRotateTransport = new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-error.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        zippedArchive: true,
        maxSize: `${env.LOG_MAX_SIZE}m`,
        maxFiles: `${env.LOG_RETENTION_DAYS}d`
      });
      
      const combinedRotateTransport = new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%-combined.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: `${env.LOG_MAX_SIZE}m`,
        maxFiles: `${env.LOG_RETENTION_DAYS}d`
      });
      
      transports.push(errorRotateTransport, combinedRotateTransport);
    } else {
      // Add regular file transports without rotation
      transports.push(
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
      );
    }
  }
  
  // Add console transport for non-production environments
  if (env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: 'HH:mm:ss' }),
          winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
            const reqId = requestId ? `[${requestId}]` : '';
            const metaStr = Object.keys(meta).length > 0 
              ? ` ${JSON.stringify(meta, null, 0)}`
              : '';
            return `${timestamp} ${level} ${reqId}: ${message}${metaStr}`;
          })
        ),
      })
    );
  }
  
  return transports;
};

// Create logger instance
const logger = winston.createLogger({
  level: getLogLevel(),
  format: getLogFormat(),
  defaultMeta: { 
    service: 'ligenia-api',
    environment: env.NODE_ENV 
  },
  transports: createTransports(),
});

// Define a type for request with an optional ID
interface RequestWithId extends Request {
  id?: string;
}

// Helper function to extract request ID from Express request
export const getRequestId = (req: RequestWithId): string => {
  return (
    (req.headers['x-request-id'] as string) ||
    req.headers['x-correlation-id'] as string ||
    req.headers['request-id'] as string ||
    req.id ||
    '-'
  );
};

// Create a function to enable request ID tracking in logs
export const logWithRequestId = (req: RequestWithId) => {
  const requestId = getRequestId(req);
  return {
    debug: (message: string, meta: Record<string, any> = {}) => 
      logger.debug(message, { ...meta, requestId }),
    info: (message: string, meta: Record<string, any> = {}) => 
      logger.info(message, { ...meta, requestId }),
    warn: (message: string, meta: Record<string, any> = {}) => 
      logger.warn(message, { ...meta, requestId }),
    error: (message: string, meta: Record<string, any> = {}) => 
      logger.error(message, { ...meta, requestId }),
  };
};

export { logger };
