import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notifications';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

// POST /api/notifications/mark-all-read - Mark all notifications as read for current user
export const POST = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;

    const result = await NotificationService.markAllAsRead(appUserId);

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
        count: result.count,
      });
    } catch (error) {
      logger.error('Mark all notifications as read error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['POST'],
  }
);