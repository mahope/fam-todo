#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting NestList production server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Node Version:', process.version);
console.log('Database URL:', process.env.DATABASE_URL?.substring(0, 30) + '...' || 'Not set');
console.log('NextAuth URL:', process.env.NEXTAUTH_URL || 'Not set');

// Detect if we're running in a container
const isContainer = fs.existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true';
console.log('Container environment:', isContainer ? 'Yes' : 'No');

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
      console.error('❌ Database connection test failed');
      console.log('🔄 Attempting alternative database check...');
      
      // Try a simpler database check
      try {
        await runCommand('node', ['-e', `
          const { PrismaClient } = require('@prisma/client');
          const prisma = new PrismaClient();
          prisma.$queryRaw\`SELECT 1\`.then(() => {
            console.log('✅ Database connection successful');
            process.exit(0);
          }).catch(e => {
            console.error('❌ Database connection failed:', e.message);
            process.exit(1);
          });
        `]);
      } catch (dbError) {
        throw new Error(`Database connection failed: ${dbError.message}`);
      }
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