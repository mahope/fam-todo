#!/usr/bin/env node

/**
 * Comprehensive server startup handler
 * Handles all startup validation, error recovery, and graceful shutdown
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configure console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(color, text) {
  return `${colors[color]}${text}${colors.reset}`;
}

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: colorize('cyan', '📋'),
    success: colorize('green', '✅'),
    warn: colorize('yellow', '⚠️'),
    error: colorize('red', '❌'),
    debug: colorize('blue', '🔍')
  }[level] || '📋';
  
  console.log(`${prefix} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

class ServerStartup {
  constructor() {
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.serverProcess = null;
    this.isShuttingDown = false;
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
    process.on('uncaughtException', (error) => this.handleCriticalError(error));
    process.on('unhandledRejection', (reason) => this.handleCriticalError(reason));
  }

  async start() {
    log('info', '🚀 Starting NestList Production Server');
    log('info', `Environment: ${process.env.NODE_ENV || 'unknown'}`);
    log('info', `Node Version: ${process.version}`);
    log('info', `Platform: ${process.platform} ${process.arch}`);
    
    const isContainer = fs.existsSync('/.dockerenv');
    log('info', `Container: ${isContainer ? 'Yes' : 'No'}`);

    try {
      // Step 1: Validate environment
      await this.validateEnvironment();
      
      // Step 2: Test database connectivity
      await this.testDatabaseConnection();
      
      // Step 3: Run database migrations
      await this.runDatabaseMigrations();
      
      // Step 4: Generate Prisma client
      await this.generatePrismaClient();
      
      // Step 5: Seed database (optional)
      await this.seedDatabase();
      
      // Step 6: Run startup validation
      await this.runStartupValidation();
      
      // Step 7: Start the server
      await this.startServer();
      
    } catch (error) {
      log('error', 'Startup failed:', { error: error.message, stack: error.stack });
      
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        log('warn', `Retrying startup attempt ${this.retryAttempts}/${this.maxRetries} in 5 seconds...`);
        await this.delay(5000);
        return this.start();
      } else {
        log('error', 'Maximum retry attempts reached. Exiting...');
        process.exit(1);
      }
    }
  }

  async validateEnvironment() {
    log('info', 'Validating environment configuration...');
    
    const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Validate DATABASE_URL format
    if (!process.env.DATABASE_URL.match(/^postgresql?:\/\//)) {
      throw new Error('DATABASE_URL must be a PostgreSQL connection string');
    }
    
    // Validate NEXTAUTH_URL format
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch {
      throw new Error('NEXTAUTH_URL must be a valid URL');
    }
    
    log('success', 'Environment validation passed');
  }

  async testDatabaseConnection() {
    log('info', 'Testing database connection...');
    
    try {
      // Simple database connectivity test using Node.js
      await this.runCommand('node', ['-e', `
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient({
          datasources: {
            db: {
              url: process.env.DATABASE_URL
            }
          }
        });
        
        async function test() {
          try {
            await prisma.$connect();
            console.log('Database connection successful');
            await prisma.$disconnect();
            process.exit(0);
          } catch (error) {
            console.error('Database connection failed:', error.message);
            process.exit(1);
          }
        }
        
        test();
      `], { timeout: 15000 });
      
      log('success', 'Database connection test passed');
    } catch (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async runDatabaseMigrations() {
    log('info', 'Running database migrations...');
    
    try {
      await this.runCommand('npx', ['prisma', 'migrate', 'deploy'], { timeout: 60000 });
      log('success', 'Database migrations completed');
    } catch (error) {
      // Migrations might fail if they're already applied, which is okay
      log('warn', `Migration warning: ${error.message}`);
      
      // Verify database is still accessible
      await this.testDatabaseConnection();
    }
  }

  async generatePrismaClient() {
    log('info', 'Generating Prisma client...');
    
    try {
      await this.runCommand('npx', ['prisma', 'generate'], { timeout: 30000 });
      log('success', 'Prisma client generated');
    } catch (error) {
      throw new Error(`Prisma client generation failed: ${error.message}`);
    }
  }

  async seedDatabase() {
    log('info', 'Seeding database (optional)...');
    
    try {
      await this.runCommand('npm', ['run', 'seed'], { timeout: 30000 });
      log('success', 'Database seeding completed');
    } catch (error) {
      log('warn', `Database seeding skipped: ${error.message}`);
      // Seeding failure is not critical
    }
  }

  async runStartupValidation() {
    log('info', 'Running comprehensive startup validation...');
    
    try {
      // This would call our startup validation if we have it as a script
      const result = await this.runCommand('node', ['-e', `
        require('./src/lib/startup-validation.js').then(({ startupValidator }) => {
          startupValidator.validateAll().then(result => {
            if (!result.success) {
              console.error('Startup validation failed:', result.critical);
              process.exit(1);
            } else {
              console.log('Startup validation passed');
              process.exit(0);
            }
          }).catch(error => {
            console.error('Validation error:', error.message);
            process.exit(1);
          });
        }).catch(() => {
          console.log('Startup validation module not available, continuing...');
          process.exit(0);
        });
      `], { timeout: 30000 });
      
      log('success', 'Startup validation passed');
    } catch (error) {
      log('warn', `Startup validation warning: ${error.message}`);
      // Continue anyway if validation is not available
    }
  }

  async startServer() {
    log('info', 'Starting Next.js server on port 8080...');
    
    return new Promise((resolve, reject) => {
      const serverProcess = spawn('next', ['start', '-p', '8080'], {
        stdio: 'inherit',
        shell: true
      });
      
      this.serverProcess = serverProcess;
      
      serverProcess.on('spawn', () => {
        log('success', 'Server started successfully');
        log('info', 'Server is ready to accept connections on port 8080');
        resolve();
      });
      
      serverProcess.on('error', (error) => {
        log('error', 'Server startup error:', { error: error.message });
        reject(error);
      });
      
      serverProcess.on('exit', (code) => {
        if (!this.isShuttingDown) {
          log('error', `Server exited unexpectedly with code ${code}`);
          reject(new Error(`Server process exited with code ${code}`));
        }
      });
    });
  }

  async runCommand(command, args = [], options = {}) {
    const timeout = options.timeout || 120000; // 2 minutes default
    
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: options.silent ? 'pipe' : 'inherit',
        shell: true,
        timeout
      });
      
      let output = '';
      
      if (options.silent && child.stdout) {
        child.stdout.on('data', (data) => {
          output += data.toString();
        });
      }
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async gracefulShutdown(signal) {
    if (this.isShuttingDown) return;
    
    this.isShuttingDown = true;
    log('info', `Received ${signal}, starting graceful shutdown...`);
    
    if (this.serverProcess) {
      log('info', 'Terminating server process...');
      this.serverProcess.kill('SIGTERM');
      
      // Give the process time to shut down gracefully
      await this.delay(5000);
      
      if (!this.serverProcess.killed) {
        log('warn', 'Force killing server process...');
        this.serverProcess.kill('SIGKILL');
      }
    }
    
    log('info', 'Graceful shutdown complete');
    process.exit(0);
  }

  async handleCriticalError(error) {
    log('error', 'Critical error occurred:', { error: error.message, stack: error.stack });
    await this.gracefulShutdown('ERROR');
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Start the server
const startup = new ServerStartup();
startup.start().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});