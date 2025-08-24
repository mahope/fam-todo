import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      debug: '/api/debug-status',
      login: '/api/auth/signin'
    },
    message: 'NestList API is operational'
  });
}