/**
 * Comprehensive server startup validation
 * Ensures all critical systems are working before accepting requests
 */

import { prisma } from './prisma';
import { env } from './env-validation';

export interface ValidationResult {
  success: boolean;
  checks: ValidationCheck[];
  critical: ValidationCheck[];
  warnings: ValidationCheck[];
}

export interface ValidationCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  error?: string;
  duration?: number;
}

class StartupValidator {
  async validateAll(): Promise<ValidationResult> {
    const checks: ValidationCheck[] = [];
    
    console.log('🔍 Running startup validation...');

    // 1. Environment Variables Check
    checks.push(await this.checkEnvironmentVariables());
    
    // 2. Database Connectivity Check
    checks.push(await this.checkDatabaseConnection());
    
    // 3. Database Schema Check
    checks.push(await this.checkDatabaseSchema());
    
    // 4. NextAuth Configuration Check
    checks.push(await this.checkNextAuthConfig());
    
    // 5. File System Permissions Check
    checks.push(await this.checkFileSystemPermissions());
    
    // 6. Memory and Resources Check
    checks.push(await this.checkSystemResources());

    const critical = checks.filter(check => check.status === 'fail');
    const warnings = checks.filter(check => check.status === 'warn');
    const success = critical.length === 0;

    return {
      success,
      checks,
      critical,
      warnings
    };
  }

  private async checkEnvironmentVariables(): Promise<ValidationCheck> {
    try {
      // Environment validation is already done in env-validation.ts
      // This is just to verify the validation worked
      if (!env.DATABASE_URL || !env.NEXTAUTH_SECRET || !env.NEXTAUTH_URL) {
        return {
          name: 'Environment Variables',
          status: 'fail',
          message: 'Required environment variables are missing',
          error: 'DATABASE_URL, NEXTAUTH_SECRET, or NEXTAUTH_URL not set'
        };
      }

      return {
        name: 'Environment Variables',
        status: 'pass',
        message: 'All required environment variables are present'
      };
    } catch (error) {
      return {
        name: 'Environment Variables',
        status: 'fail',
        message: 'Environment validation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkDatabaseConnection(): Promise<ValidationCheck> {
    const startTime = Date.now();
    
    try {
      // Test basic connectivity
      await prisma.$queryRaw`SELECT 1 as test`;
      
      // Test transaction capability
      await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT 1 as transaction_test`;
      });

      const duration = Date.now() - startTime;

      if (duration > 5000) {
        return {
          name: 'Database Connection',
          status: 'warn',
          message: `Database connection slow (${duration}ms)`,
          duration
        };
      }

      return {
        name: 'Database Connection',
        status: 'pass',
        message: `Database connection successful (${duration}ms)`,
        duration
      };
    } catch (error) {
      return {
        name: 'Database Connection',
        status: 'fail',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown database error',
        duration: Date.now() - startTime
      };
    }
  }

  private async checkDatabaseSchema(): Promise<ValidationCheck> {
    try {
      // Check if critical tables exist by querying them safely
      const tables = [
        { name: 'users', query: () => prisma.user.findFirst() },
        { name: 'families', query: () => prisma.family.findFirst() },
        { name: 'app_users', query: () => prisma.appUser.findFirst() },
        { name: 'lists', query: () => prisma.list.findFirst() },
        { name: 'tasks', query: () => prisma.task.findFirst() }
      ];
      
      for (const table of tables) {
        try {
          await table.query();
        } catch (error) {
          // Table might be empty, which is fine, but other errors are not
          if (error instanceof Error && !error.message.includes('RecordNotFound')) {
            throw new Error(`Table ${table.name} is not accessible: ${error.message}`);
          }
        }
      }

      return {
        name: 'Database Schema',
        status: 'pass',
        message: 'All critical tables are accessible'
      };
    } catch (error) {
      return {
        name: 'Database Schema',
        status: 'fail',
        message: 'Database schema validation failed',
        error: error instanceof Error ? error.message : 'Schema error'
      };
    }
  }

  private async checkNextAuthConfig(): Promise<ValidationCheck> {
    try {
      // Validate NEXTAUTH_URL format
      new URL(env.NEXTAUTH_URL);
      
      // Check NEXTAUTH_SECRET length
      if (env.NEXTAUTH_SECRET.length < 32) {
        return {
          name: 'NextAuth Configuration',
          status: 'warn',
          message: 'NEXTAUTH_SECRET should be at least 32 characters for security'
        };
      }

      return {
        name: 'NextAuth Configuration',
        status: 'pass',
        message: 'NextAuth configuration is valid'
      };
    } catch (error) {
      return {
        name: 'NextAuth Configuration',
        status: 'fail',
        message: 'NextAuth configuration is invalid',
        error: error instanceof Error ? error.message : 'Configuration error'
      };
    }
  }

  private async checkFileSystemPermissions(): Promise<ValidationCheck> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Check if we can write to the .next directory
      const nextDir = path.join(process.cwd(), '.next');
      const testFile = path.join(nextDir, 'startup-test.tmp');
      
      try {
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
      } catch (error) {
        return {
          name: 'File System Permissions',
          status: 'warn',
          message: 'Cannot write to .next directory',
          error: error instanceof Error ? error.message : 'Permission error'
        };
      }

      return {
        name: 'File System Permissions',
        status: 'pass',
        message: 'File system permissions are adequate'
      };
    } catch (error) {
      return {
        name: 'File System Permissions',
        status: 'warn',
        message: 'Could not check file system permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async checkSystemResources(): Promise<ValidationCheck> {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const memoryTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      
      // Warn if using more than 512MB at startup
      if (memoryUsedMB > 512) {
        return {
          name: 'System Resources',
          status: 'warn',
          message: `High memory usage at startup: ${memoryUsedMB}MB / ${memoryTotalMB}MB`
        };
      }

      return {
        name: 'System Resources',
        status: 'pass',
        message: `Memory usage normal: ${memoryUsedMB}MB / ${memoryTotalMB}MB`
      };
    } catch (error) {
      return {
        name: 'System Resources',
        status: 'warn',
        message: 'Could not check system resources',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const startupValidator = new StartupValidator();