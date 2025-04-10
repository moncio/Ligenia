# Logging Migration Example

This document demonstrates how to migrate from using `console.log` statements to the new structured logging system.

## Before: Using console.log

```typescript
// src/api/controllers/example.controller.ts
import { Request, Response } from 'express';

export class ExampleController {
  public getExample = async (req: Request, res: Response) => {
    console.log('Received request for getExample');
    console.log('Query params:', req.query);
    
    try {
      // Some business logic
      const result = { data: 'example' };
      
      console.log('Returning response:', result);
      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      console.error('Error in getExample:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
}
```

## After: Using the structured logger

```typescript
// src/api/controllers/example.controller.ts
import { Request, Response } from 'express';
import { logWithRequestId } from '../../config/logger';

export class ExampleController {
  public getExample = async (req: Request, res: Response) => {
    const log = logWithRequestId(req);
    
    log.info('Processing getExample request', { 
      query: req.query,
      path: req.path
    });
    
    try {
      // Some business logic
      const result = { data: 'example' };
      
      log.info('Request processed successfully', { result });
      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      log.error('Error processing request', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        query: req.query
      });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
}
```

## Key Differences

1. **Import the logger**: Import the `logWithRequestId` helper
2. **Initialize with request**: Get a logger instance with the request ID
3. **Structured metadata**: Include relevant context as a second parameter object
4. **Consistent log levels**: Use `info` for normal operations and `error` for errors
5. **Error handling**: Properly format errors with message and stack trace
6. **Request context**: The request ID is automatically included in all logs

## Benefits

1. **Request tracing**: All logs from the same request have the same request ID
2. **Structured data**: Logs are in JSON format for easier parsing and analysis
3. **Consistent formatting**: All logs follow the same structure
4. **Environment-specific behavior**: Different log levels for different environments
5. **Performance**: Logs below the configured level are not processed
6. **Security**: Sensitive data is automatically redacted

## Log Output Example

```json
{
  "level": "info",
  "message": "Processing getExample request",
  "service": "ligenia-api",
  "environment": "development",
  "timestamp": "2023-04-19T10:30:45.123Z",
  "requestId": "5d7e8f6a-dc45-4b7c-a85e-f94d1c8d6b9a",
  "query": { "filter": "active", "sort": "name" },
  "path": "/api/examples"
}
```

## Migration Steps

1. Run the helper script to identify console.log statements:
   ```bash
   node scripts/update-console-logs.js
   ```

2. For each identified file, follow these steps:
   - Import the appropriate logger
   - Replace console.log with log.info or appropriate level
   - Add structured context in a second parameter
   - Format errors properly in catch blocks

3. Test and verify that logs appear correctly in the console and log files 