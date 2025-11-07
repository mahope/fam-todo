import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService, NotificationPayload } from '@/lib/services/push-notifications';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

// POST /api/push/send - Send push notification (admin/testing only)
export const POST = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { appUserId, familyId, role } = sessionData;
    
    // Only allow admins to send push notifications directly
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can send push notifications' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const {
      payload,
      target = 'family', // 'user', 'family', 'adults'
      targetUserId,
    } = body;

    if (!payload || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Invalid notification payload' },
        { status: 400 }
      );
    }

    let result;

    switch (target) {
      case 'user':
        if (!targetUserId) {
          return NextResponse.json(
            { error: 'targetUserId is required for user target' },
            { status: 400 }
          );
        }
        result = await pushNotificationService.sendToUser(targetUserId, payload as NotificationPayload);
        break;

      case 'adults':
        result = await pushNotificationService.sendToFamilyAdults(
          familyId,
          payload as NotificationPayload,
          appUserId
        );
        break;

      case 'family':
      default:
        result = await pushNotificationService.sendToFamily(
          familyId,
          payload as NotificationPayload,
          appUserId
        );
        break;
    }

    return NextResponse.json({
      success: true,
      result,
      message: 'Push notifications sent',
    });

  } catch (error) {
    logger.error('Push send error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
},
{
  requireAuth: true,
  rateLimitRule: 'api',
  allowedMethods: ['POST'],
}
);