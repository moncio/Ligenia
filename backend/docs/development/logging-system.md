# Logging System Guide

This document explains how to use the logging system in the Ligenia backend application.

## Overview

The logging system is built on top of Winston and provides:

- Structured JSON logging for machine readability
- Log rotation with daily files
- Request ID tracking for correlating logs from a single request
- Log levels based on environment (development, test, production)
- Sensitive data redaction to prevent exposing secrets in logs

## Configuration

The logging system is configured via environment variables in `.env`:

```
# Logging Configuration
# Log levels: error, warn, info, http, verbose, debug, silly
LOG_LEVEL=info
# Log format (json, simple, colorized)
LOG_FORMAT=json
# Log redaction (true/false) - redacts sensitive data in logs
LOG_REDACT_SENSITIVE=true
# Enable file logging (true/false)
LOG_TO_FILE=true
# Enable file rotation (true/false)
LOG_ROTATION=true
# Log retention period in days
LOG_RETENTION_DAYS=14
# Maximum log file size in MB
LOG_MAX_SIZE=20
```

## Log Levels

The following log levels are available, in order of increasing verbosity:

1. `error` - Critical errors that need immediate attention
2. `warn` - Warnings that don't stop the application but indicate potential issues
3. `info` - General informational messages about application state
4. `http` - Detailed HTTP request/response logs
5. `verbose` - Detailed information for debugging application flow
6. `debug` - Highly detailed debugging information
7. `silly` - Most verbose logging level, rarely used

The default log level in production is `info`, which means it only logs `info`, `warn`, and `error` messages.

## Usage

### In Controllers and Request Handlers

In any file that handles HTTP requests, use the `logWithRequestId` function to include the request ID in logs:

```typescript
import { Request, Response } from 'express';
import { logWithRequestId } from '../../config/logger';

export class ExampleController {
  public getSomething = async (req: Request, res: Response) => {
    // Get logger with request ID from the current request
    const log = logWithRequestId(req);
    
    try {
      // Log info message
      log.info('Processing request', { 
        params: req.params,
        query: req.query
      });
      
      // ... processing logic ...
      
      // Log successful completion
      log.info('Request processed successfully', { 
        result: 'some metadata about result'
      });
      
      return res.status(200).json({ success: true });
    } catch (error) {
      // Log errors with details
      log.error('Error processing request', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        params: req.params
      });
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
```

### In Services, Repositories, and Other Non-Request Code

For code that doesn't have access to the request object, use the main logger:

```typescript
import { logger } from '../../config/logger';

export class ExampleService {
  public doSomething() {
    try {
      logger.info('Starting background process');
      
      // ... processing logic ...
      
      logger.info('Background process completed');
    } catch (error) {
      logger.error('Error in background process', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  }
}
```

## Best Practices

1. **Use appropriate log levels**:
   - `error` - For exceptions and critical errors only
   - `warn` - For potentially problematic situations that don't cause failures
   - `info` - For tracking normal application flow
   - `debug` - For detailed debugging information (not visible in production)

2. **Structure your log messages**:
   - First parameter: Short, descriptive message
   - Second parameter: Object with relevant contextual data

3. **Include context in logs**:
   - For errors, include error message, error stack, and context
   - For operations, include relevant IDs and parameters
   - Never log sensitive data (passwords, tokens, etc.)

4. **Log at start and end of important operations**:
   - Log at the beginning of significant operations
   - Log completion with outcome (success/failure and relevant metrics)

5. **Replace console.log with the appropriate logger**:
   - Use our script to help identify console.log statements to replace:
   ```
   node scripts/update-console-logs.js
   ```

## Log Examples

```
// Error log
{"level":"error","message":"Error creating user","service":"ligenia-api","environment":"development","timestamp":"2023-04-19T10:30:45.123Z","requestId":"5d7e8f6a-dc45-4b7c-a85e-f94d1c8d6b9a","error":"Duplicate email address","stack":"...stack trace...","email":"user@example.com"}

// Info log
{"level":"info","message":"User logged in successfully","service":"ligenia-api","environment":"development","timestamp":"2023-04-19T10:30:45.123Z","requestId":"5d7e8f6a-dc45-4b7c-a85e-f94d1c8d6b9a","userId":"123456","email":"user@example.com"}
```

## Viewing Logs

- **Development**: Logs are printed to the console and stored in the `logs` directory
- **Production**: Logs are stored in the `logs` directory in JSON format
- **Daily Rotation**: Logs are rotated daily with the format `YYYY-MM-DD-combined.log` and `YYYY-MM-DD-error.log`

To view recent logs:

```bash
# View latest combined log
tail -f logs/$(date +%Y-%m-%d)-combined.log

# View latest error log
tail -f logs/$(date +%Y-%m-%d)-error.log

# Parse JSON logs for better readability
tail -f logs/$(date +%Y-%m-%d)-combined.log | jq
``` 