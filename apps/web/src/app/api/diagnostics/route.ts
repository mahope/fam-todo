import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  const startTime = Date.now();
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {}
  };

  logger.info('Starting diagnostics check');

  // 1. Database Connection Test
  try {
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.checks.database = {
      status: 'OK',
      message: 'Database connection successful'
    };
    logger.info('Database connection: OK');
  } catch (error) {
    diagnostics.checks.database = {
      status: 'ERROR',
      message: `Database connection failed: ${error}`
    };
    logger.error('Database connection failed:', error as any);
  }

  // 2. Authentication Test
  try {
    const session = await getServerSession(authOptions) as any;
    diagnostics.checks.authentication = {
      status: session ? 'OK' : 'NO_SESSION',
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      message: session ? 'Authentication working' : 'No active session'
    };
    logger.info('Authentication check:', { hasSession: !!session, hasUser: !!session?.user });
  } catch (error) {
    diagnostics.checks.authentication = {
      status: 'ERROR',
      message: `Authentication failed: ${error}`
    };
    logger.error('Authentication check failed:', error as any);
  }

  // 3. User Data Test (if authenticated)
  if (diagnostics.checks.authentication.status === 'OK') {
    try {
      const session = await getServerSession(authOptions) as any;
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { appUser: true },
      });

      diagnostics.checks.userData = {
        status: user ? 'OK' : 'NOT_FOUND',
        hasUser: !!user,
        hasAppUser: !!user?.appUser,
        familyId: user?.appUser?.familyId,
        role: user?.appUser?.role,
        message: user ? 'User data retrieved successfully' : 'User not found in database'
      };
      logger.info('User data check:', { hasUser: !!user, hasAppUser: !!user?.appUser });
    } catch (error) {
      diagnostics.checks.userData = {
        status: 'ERROR',
        message: `User data query failed: ${error}`
      };
      logger.error('User data check failed:', error as any);
    }
  }

  // 4. Lists Query Test (if user data exists)
  if (diagnostics.checks.userData?.status === 'OK') {
    try {
      const session = await getServerSession(authOptions) as any;
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { appUser: true },
      });

      const lists = await prisma.list.findMany({
        where: {
          familyId: user!.appUser!.familyId,
        },
        select: { id: true, name: true, visibility: true },
        take: 5
      });

      diagnostics.checks.listsQuery = {
        status: 'OK',
        count: lists.length,
        sampleLists: lists,
        message: `Found ${lists.length} lists in database`
      };
      logger.info('Lists query check:', { count: lists.length });
    } catch (error) {
      diagnostics.checks.listsQuery = {
        status: 'ERROR',
        message: `Lists query failed: ${error}`
      };
      logger.error('Lists query check failed:', error as any);
    }
  }

  // 5. Environment Variables Check
  diagnostics.checks.environment = {
    status: 'INFO',
    variables: {
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'MISSING',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      NODE_ENV: process.env.NODE_ENV
    }
  };

  diagnostics.responseTime = `${Date.now() - startTime}ms`;
  diagnostics.overallStatus = Object.values(diagnostics.checks).some((check: any) => check.status === 'ERROR') ? 'ERROR' : 'OK';

  logger.info('Diagnostics completed:', { 
    overallStatus: diagnostics.overallStatus,
    responseTime: diagnostics.responseTime 
  });

  return NextResponse.json(diagnostics, {
    status: diagnostics.overallStatus === 'ERROR' ? 500 : 200
  });
}