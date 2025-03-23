#!/usr/bin/env node

/**
 * API Integration Tests Runner
 * 
 * This script runs all API integration tests and generates a summary report.
 * It helps to verify that all endpoints are properly tested and working as expected.
 */

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const testDir = path.join(__dirname, 'integration', 'routes');
const testTimeout = 30000; // 30 seconds timeout for each test suite

// ANSI color codes for formatting output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

// Get all test files
const testFiles = fs.readdirSync(testDir)
  .filter(file => file.endsWith('.test.ts'))
  .map(file => path.join(testDir, file));

console.log(`${colors.bright}${colors.blue}=== LIGENIA API Integration Tests ====${colors.reset}\n`);
console.log(`${colors.cyan}Found ${testFiles.length} test files to run${colors.reset}\n`);

// Results storage
const results = {
  total: testFiles.length,
  passed: 0,
  failed: 0,
  skipped: 0,
  details: []
};

// Run each test file
for (const testFile of testFiles) {
  const fileName = path.basename(testFile);
  const moduleName = fileName.replace('.test.ts', '');
  
  console.log(`${colors.bright}${colors.yellow}Running tests for: ${moduleName}${colors.reset}`);
  
  const result = spawnSync('npx', ['jest', testFile, '--forceExit', '--detectOpenHandles'], {
    stdio: 'inherit',
    timeout: testTimeout,
    env: { ...process.env, NODE_ENV: 'test' }
  });
  
  const fileResult = {
    module: moduleName,
    file: fileName,
    status: result.status === 0 ? 'passed' : 'failed',
    signal: result.signal
  };
  
  if (fileResult.status === 'passed') {
    results.passed++;
    console.log(`${colors.green}✓ ${moduleName} tests passed${colors.reset}\n`);
  } else {
    results.failed++;
    if (result.signal === 'SIGTERM') {
      console.log(`${colors.red}✗ ${moduleName} tests timed out${colors.reset}\n`);
      fileResult.status = 'timeout';
    } else {
      console.log(`${colors.red}✗ ${moduleName} tests failed${colors.reset}\n`);
    }
  }
  
  results.details.push(fileResult);
}

// Print summary
console.log(`${colors.bright}${colors.blue}=== Test Summary ====${colors.reset}\n`);
console.log(`${colors.white}Total test files: ${results.total}${colors.reset}`);
console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
if (results.skipped > 0) {
  console.log(`${colors.yellow}Skipped: ${results.skipped}${colors.reset}`);
}

// Print details of failed tests
if (results.failed > 0) {
  console.log(`\n${colors.bright}${colors.red}Failed Tests:${colors.reset}`);
  results.details
    .filter(r => r.status !== 'passed')
    .forEach(r => {
      console.log(`${colors.red}• ${r.module} (${r.file})${r.status === 'timeout' ? ' - Timed out' : ''}${colors.reset}`);
    });
}

// Return appropriate exit code
process.exit(results.failed > 0 ? 1 : 0); 