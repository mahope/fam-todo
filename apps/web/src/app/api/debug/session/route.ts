import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { logger } from '@/lib/logger';

export async function GET() {
  logger.info('Debug session endpoint called');
  
  try {
    const session = await getServerSession(authOptions);
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      sessionData: session ? {
        hasUser: !!session.user,
        userId: session.user?.id,
        userEmail: session.user?.email,
        expires: session.expires
      } : null,
      authOptions: {
        providersCount: authOptions.providers?.length || 0,
        hasJwtConfig: !!authOptions.jwt,
        hasSessionConfig: !!authOptions.session,
        callbackUrl: authOptions.callbacks ? 'configured' : 'not configured'
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        hasDATABASE_URL: !!process.env.DATABASE_URL
      }
    };
    
    logger.info('Session debug info:', debugInfo);
    
    return NextResponse.json(debugInfo);
  } catch (error) {
    logger.error('Session debug error:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}