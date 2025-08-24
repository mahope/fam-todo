import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const healthData = {
    status: 'unknown',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    port: process.env.PORT || 'unknown',
    database: 'unknown',
    checks: {} as any,
    services: {
      web: 'healthy',
      database: 'unknown'
    }
  };

  try {
    // Check database connectivity
    console.log('Health check: Testing database connection...');
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as test`;
    const dbTime = Date.now() - startTime;
    
    healthData.database = 'connected';
    healthData.services.database = 'healthy';
    healthData.checks.database = {
      status: 'healthy',
      responseTime: `${dbTime}ms`
    };

    // Check environment variables
    healthData.checks.environment = {
      nextauthUrl: !!process.env.NEXTAUTH_URL,
      nextauthSecret: !!process.env.NEXTAUTH_SECRET,
      databaseUrl: !!process.env.DATABASE_URL,
      nodeEnv: process.env.NODE_ENV
    };

    healthData.status = 'healthy';
    console.log('Health check: All systems healthy');
    return NextResponse.json(healthData, { status: 200 });

  } catch (error) {
    console.error('Health check failed:', error);
    
    healthData.status = 'unhealthy';
    healthData.database = 'disconnected';
    healthData.services.database = 'unhealthy';
    healthData.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown database error'
    };

    return NextResponse.json(healthData, { status: 503 });
  }
}