#!/usr/bin/env node

/**
 * Ensures the logs directory exists before the application starts
 * This script is meant to be run during application startup
 */

const fs = require('fs');
const path = require('path');

// Define logs directory path (relative to project root)
const logDir = path.resolve(__dirname, '../logs');

// Check if logs directory exists
if (!fs.existsSync(logDir)) {
  console.log('Creating logs directory...');
  fs.mkdirSync(logDir, { recursive: true });
  console.log('Logs directory created successfully!');
} else {
  console.log('Logs directory already exists.');
}

// Exit with success
process.exit(0); 