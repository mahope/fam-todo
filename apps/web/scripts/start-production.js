#!/usr/bin/env node

/**
 * Simple production startup script
 * No complex validation - just start the server
 */

console.log('🚀 Starting NestList Production Server');
console.log(`Node Version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
console.log(`Port: 8080`);

// Start Next.js directly
const { spawn } = require('child_process');

const server = spawn('next', ['start', '-p', '8080'], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (error) => {
  console.error('❌ Server failed to start:', error.message);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  server.kill('SIGTERM');
});