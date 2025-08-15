import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/security/auth-middleware';
import { getErrorReports, getErrorStats, errorTracker } from '@/lib/monitoring/error-tracking';
import { SessionData } from '@/lib/auth/types';

export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      // Only admins can access error reports
      if (sessionData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const url = new URL(request.url);
      const severity = url.searchParams.get('severity') || undefined;
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const since = url.searchParams.get('since') || undefined;
      const statsOnly = url.searchParams.get('stats') === 'true';

      if (statsOnly) {
        const stats = getErrorStats();
        return NextResponse.json({
          stats,
          timestamp: new Date().toISOString(),
        });
      }

      const reports = getErrorReports({ severity, limit, since });
      const stats = getErrorStats();

      return NextResponse.json({
        reports,
        stats,
        total: reports.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to get error reports:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve error reports' },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET', 'DELETE'],
  }
);

export const DELETE = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      // Only admins can clear errors
      if (sessionData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const url = new URL(request.url);
      const fingerprint = url.searchParams.get('fingerprint');
      const all = url.searchParams.get('all') === 'true';

      if (all) {
        errorTracker.clearAllErrors();
        return NextResponse.json({
          message: 'All errors cleared',
          timestamp: new Date().toISOString(),
        });
      }

      if (!fingerprint) {
        return NextResponse.json(
          { error: 'Fingerprint parameter required' },
          { status: 400 }
        );
      }

      const cleared = errorTracker.clearError(fingerprint);
      
      if (!cleared) {
        return NextResponse.json(
          { error: 'Error not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Error cleared',
        fingerprint,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to clear errors:', error);
      return NextResponse.json(
        { error: 'Failed to clear errors' },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET', 'DELETE'],
  }
);