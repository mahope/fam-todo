#!/usr/bin/env node

/**
 * Ultra-simple production startup script
 */

console.log('🚀 Starting NestList Production Server');
console.log(`Node Version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);

// Start Next.js directly with simple spawn
const { spawn } = require('child_process');

const server = spawn('next', ['start'], {
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

server.on('error', (error) => {
  console.error('❌ Server start error:', error.message);
  process.exit(1);
});

process.on('SIGINT', () => server.kill('SIGINT'));
process.on('SIGTERM', () => server.kill('SIGTERM'));