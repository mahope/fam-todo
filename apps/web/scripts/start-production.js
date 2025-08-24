#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting production server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...' || 'Not set');

// Function to run a command and return a promise
function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 Running: ${command} ${args.join(' ')}`);
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function startProduction() {
  try {
    // Check required environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    if (!process.env.NEXTAUTH_SECRET) {
      throw new Error('NEXTAUTH_SECRET environment variable is required');
    }
    
    if (!process.env.NEXTAUTH_URL) {
      throw new Error('NEXTAUTH_URL environment variable is required');
    }

    // Test database connection
    console.log('🔍 Testing database connection...');
    try {
      await runCommand('npx', ['prisma', 'db', 'pull', '--force-reset']);
    } catch (error) {
      throw new Error('Database connection failed');
    }

    // Run database migrations
    console.log('📦 Running database migrations...');
    await runCommand('npx', ['prisma', 'migrate', 'deploy']);

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    await runCommand('npx', ['prisma', 'generate']);

    // Seed database (optional)
    console.log('🌱 Seeding database...');
    try {
      await runCommand('npm', ['run', 'seed']);
    } catch (error) {
      console.log('⚠️  Seeding failed, but continuing...');
    }

    // Start the application
    console.log('🌟 Starting Next.js server on port 8080...');
    await runCommand('next', ['start', '-p', '8080']);

  } catch (error) {
    console.error('❌ Error occurred during startup:', error.message);
    process.exit(1);
  }
}

startProduction();