import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notifications';
import { getSessionData } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

// POST /api/notifications/mark-all-read - Mark all notifications as read for current user
export async function POST(request: NextRequest) {
  try {
    const { appUserId } = await getSessionData();

    const result = await NotificationService.markAllAsRead(appUserId);

    return NextResponse.json({
      success: true,
      message: 'All notifications marked as read',
      count: result.count,
    });
  } catch (error) {
    logger.error('Mark all notifications as read error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}