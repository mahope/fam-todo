import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductionApiErrorHandler } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      port: process.env.PORT || '8080',
    },
    database: {
      status: 'unknown',
      responseTime: null as number | null,
      error: null as string | null,
    },
    environment: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuth: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hasVapidKeys: !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
    },
    checks: [] as any[],
  };

  // Database connectivity test
  try {
    console.log('Diagnostics: Testing database connection...');
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const dbTime = Date.now() - startTime;
    
    diagnostics.database.status = 'connected';
    diagnostics.database.responseTime = dbTime;
    diagnostics.checks.push({
      name: 'Database Connection',
      status: 'pass',
      responseTime: `${dbTime}ms`
    });
  } catch (error) {
    console.error('Diagnostics: Database test failed:', error);
    diagnostics.database.status = 'failed';
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error';
    diagnostics.checks.push({
      name: 'Database Connection',
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: (error as any)?.code || 'UNKNOWN'
    });
  }

  // Environment validation
  const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  diagnostics.checks.push({
    name: 'Environment Variables',
    status: missingVars.length === 0 ? 'pass' : 'fail',
    missing: missingVars
  });

  // Next.js API test
  try {
    diagnostics.checks.push({
      name: 'Next.js API',
      status: 'pass',
      message: 'API routing working correctly'
    });
  } catch (error) {
    diagnostics.checks.push({
      name: 'Next.js API',
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  const allPassed = diagnostics.checks.every(check => check.status === 'pass');
  
  return NextResponse.json({
    status: allPassed ? 'healthy' : 'degraded',
    ...diagnostics
  }, { 
    status: allPassed ? 200 : 503 
  });
}