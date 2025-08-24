import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Simple debug endpoint that doesn't rely on database
  const debugInfo = {
    status: 'server-running',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'unknown',
    port: process.env.PORT || 'unknown',
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasNextAuth: !!process.env.NEXTAUTH_SECRET,
      hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
      nextAuthUrl: process.env.NEXTAUTH_URL,
    }
  };

  return NextResponse.json(debugInfo, { status: 200 });
}