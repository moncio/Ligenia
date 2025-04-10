#!/usr/bin/env node

/**
 * This script provides guidance for replacing console.log/error statements with the logger system.
 * It doesn't make the changes automatically but provides information on the changes needed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths to ignore
const IGNORE_PATHS = [
  'node_modules',
  'dist',
  'logs',
  'tests',
  'scripts',
  'prisma',
];

// Define production code paths to focus on
const PRODUCTION_CODE_PATHS = [
  'src/api/controllers',
  'src/api/middlewares',
  'src/api/routes',
  'src/core',
  'src/infrastructure',
  'src/shared',
];

// Guidance templates to help developers update console.log statements
const GUIDANCE = {
  usage: `
// To use the logger in a controller or middleware:

import { logWithRequestId } from '../../config/logger';

// Within a request handler:
const log = logWithRequestId(req);
log.info('Message here', { optional: 'metadata' });
log.error('Error message', { error: err.message, stack: err.stack });

// Outside of a request context:
import { logger } from '../../config/logger';
logger.info('Message here', { optional: 'metadata' });
  `,
  consoleLogToInfo: (file, line, content) => 
    `Replace in ${file}:${line}:\n  ${content.trim()}\nwith:\n  log.info('...',  {...});\n`,
  
  consoleErrorToError: (file, line, content) => 
    `Replace in ${file}:${line}:\n  ${content.trim()}\nwith:\n  log.error('...', { error: error instanceof Error ? error.message : 'Unknown error' });\n`,
  
  consoleWarnToWarn: (file, line, content) => 
    `Replace in ${file}:${line}:\n  ${content.trim()}\nwith:\n  log.warn('...', {...});\n`,
};

// Function to check if a path should be ignored
const shouldIgnorePath = (filePath) => {
  return IGNORE_PATHS.some(ignorePath => filePath.includes(ignorePath));
};

// Function to check if a path is in production code
const isProductionCode = (filePath) => {
  return PRODUCTION_CODE_PATHS.some(prodPath => filePath.includes(prodPath));
};

// Run grep to find all console.log/error/warn statements in the src directory
try {
  console.log('Searching for console.log statements in production code...\n');
  
  // Find console.log/error/warn statements
  const grepCmd = 'grep -r "console\\." --include="*.ts" src/ | grep -v "//.*console\\."';
  const grepResult = execSync(grepCmd, { encoding: 'utf8' });
  
  const lines = grepResult.split('\n').filter(Boolean);
  
  // Count and categorize findings
  let totalCount = 0;
  let prodCodeCount = 0;
  
  console.log('Results:');
  console.log('========\n');
  
  lines.forEach(line => {
    const [filePath, content] = line.split(':', 2);
    const remainingContent = line.substring(filePath.length + 1);
    
    if (shouldIgnorePath(filePath)) {
      return;
    }
    
    totalCount++;
    
    if (isProductionCode(filePath)) {
      prodCodeCount++;
      
      console.log(`File: ${filePath}`);
      
      if (remainingContent.includes('console.log')) {
        console.log(GUIDANCE.consoleLogToInfo(filePath, '', remainingContent));
      } else if (remainingContent.includes('console.error')) {
        console.log(GUIDANCE.consoleErrorToError(filePath, '', remainingContent));
      } else if (remainingContent.includes('console.warn')) {
        console.log(GUIDANCE.consoleWarnToWarn(filePath, '', remainingContent));
      }
      
      console.log('---\n');
    }
  });
  
  console.log(`Found ${totalCount} console statements in the codebase.`);
  console.log(`${prodCodeCount} statements need to be updated in production code.\n`);
  
  console.log('Usage Guide:');
  console.log(GUIDANCE.usage);
  
} catch (error) {
  console.error('Error running the script:', error);
  process.exit(1);
}

console.log('\nScript completed successfully.'); 