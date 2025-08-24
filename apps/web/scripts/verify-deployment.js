#!/usr/bin/env node

/**
 * Comprehensive deployment verification script
 * Tests all critical functionality before declaring deployment successful
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentVerifier {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0
    };
  }

  async runAllTests() {
    console.log('🧪 Running comprehensive deployment verification...\n');

    // 1. Environment validation
    await this.runTest('Environment Variables', () => this.testEnvironmentVariables());

    // 2. TypeScript compilation
    await this.runTest('TypeScript Compilation', () => this.testTypeScriptCompilation());

    // 3. Build process
    await this.runTest('Build Process', () => this.testBuildProcess());

    // 4. Database connectivity
    await this.runTest('Database Connection', () => this.testDatabaseConnection());

    // 5. Critical files existence
    await this.runTest('Critical Files', () => this.testCriticalFiles());

    // 6. API routes basic test
    await this.runTest('API Routes Structure', () => this.testApiRoutes());

    // 7. Dependencies check
    await this.runTest('Dependencies', () => this.testDependencies());

    this.printSummary();
    
    if (this.results.failed > 0) {
      process.exit(1);
    }
  }

  async runTest(name, testFunction) {
    this.results.total++;
    
    try {
      console.log(`🔍 Testing ${name}...`);
      const result = await testFunction();
      
      if (result.status === 'pass') {
        console.log(`✅ ${name}: ${result.message}`);
        this.results.passed++;
      } else if (result.status === 'warn') {
        console.log(`⚠️  ${name}: ${result.message}`);
        this.results.warnings++;
      } else {
        console.log(`❌ ${name}: ${result.message}`);
        this.results.failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      this.results.failed++;
    }
    
    console.log('');
  }

  async testEnvironmentVariables() {
    const required = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
    const missing = required.filter(env => !process.env[env]);

    if (missing.length > 0) {
      return {
        status: 'fail',
        message: `Missing required environment variables: ${missing.join(', ')}`
      };
    }

    // Validate formats
    if (!process.env.DATABASE_URL.match(/^postgresql?:\/\//)) {
      return {
        status: 'fail',
        message: 'DATABASE_URL must be a PostgreSQL connection string'
      };
    }

    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch {
      return {
        status: 'fail',
        message: 'NEXTAUTH_URL must be a valid URL'
      };
    }

    if (process.env.NEXTAUTH_SECRET.length < 32) {
      return {
        status: 'warn',
        message: 'NEXTAUTH_SECRET should be at least 32 characters'
      };
    }

    return {
      status: 'pass',
      message: 'All environment variables are properly configured'
    };
  }

  async testTypeScriptCompilation() {
    try {
      await this.runCommand('npx', ['tsc', '--noEmit'], { timeout: 60000 });
      return {
        status: 'pass',
        message: 'TypeScript compilation successful'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `TypeScript compilation failed: ${error.message}`
      };
    }
  }

  async testBuildProcess() {
    try {
      await this.runCommand('npm', ['run', 'build'], { timeout: 300000 }); // 5 minutes
      return {
        status: 'pass',
        message: 'Build process completed successfully'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Build process failed: ${error.message}`
      };
    }
  }

  async testDatabaseConnection() {
    try {
      await this.runCommand('node', ['-e', `
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        prisma.$connect().then(() => {
          console.log('Database connection successful');
          return prisma.$disconnect();
        }).then(() => {
          process.exit(0);
        }).catch(error => {
          console.error('Database connection failed:', error.message);
          process.exit(1);
        });
      `], { timeout: 15000 });

      return {
        status: 'pass',
        message: 'Database connection successful'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Database connection failed: ${error.message}`
      };
    }
  }

  async testCriticalFiles() {
    const criticalFiles = [
      'package.json',
      'next.config.mjs',
      'prisma/schema.prisma',
      'src/lib/prisma.ts',
      'src/lib/auth-config.ts',
      'src/app/api/auth/[...nextauth]/route.ts',
      'src/middleware.ts'
    ];

    const missingFiles = [];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        missingFiles.push(file);
      }
    }

    if (missingFiles.length > 0) {
      return {
        status: 'fail',
        message: `Missing critical files: ${missingFiles.join(', ')}`
      };
    }

    return {
      status: 'pass',
      message: 'All critical files are present'
    };
  }

  async testApiRoutes() {
    const apiRoutes = [
      'src/app/api/health/route.ts',
      'src/app/api/auth/[...nextauth]/route.ts',
      'src/pages/api/socket.ts'
    ];

    const missingRoutes = [];

    for (const route of apiRoutes) {
      if (!fs.existsSync(route)) {
        missingRoutes.push(route);
      }
    }

    if (missingRoutes.length > 0) {
      return {
        status: 'fail',
        message: `Missing critical API routes: ${missingRoutes.join(', ')}`
      };
    }

    return {
      status: 'pass',
      message: 'All critical API routes are present'
    };
  }

  async testDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const criticalDeps = [
        'next',
        'react',
        'prisma',
        '@prisma/client',
        'next-auth',
        'socket.io'
      ];

      const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const missingDeps = criticalDeps.filter(dep => !allDeps[dep]);

      if (missingDeps.length > 0) {
        return {
          status: 'fail',
          message: `Missing critical dependencies: ${missingDeps.join(', ')}`
        };
      }

      return {
        status: 'pass',
        message: 'All critical dependencies are present'
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `Dependency check failed: ${error.message}`
      };
    }
  }

  async runCommand(command, args = [], options = {}) {
    const timeout = options.timeout || 30000;

    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: true,
        timeout
      });

      let output = '';
      let errorOutput = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  printSummary() {
    console.log('📊 Deployment Verification Summary');
    console.log('================================');
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📋 Total: ${this.results.total}`);
    console.log('');

    if (this.results.failed === 0) {
      console.log('🎉 Deployment verification completed successfully!');
      console.log('The application is ready for production deployment.');
    } else {
      console.log('💥 Deployment verification failed!');
      console.log('Please fix the failed tests before deploying to production.');
    }
  }
}

// Run verification
const verifier = new DeploymentVerifier();
verifier.runAllTests().catch(error => {
  console.error('Verification script error:', error);
  process.exit(1);
});