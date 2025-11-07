import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/services/push-notifications';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

// POST /api/push/subscribe - Subscribe to push notifications
export const POST = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;
      const body = await request.json();
    
    const { subscription } = body;
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // Validate subscription format
    if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription keys' },
        { status: 400 }
      );
    }

    await pushNotificationService.saveSubscription(appUserId, subscription);

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription saved',
    });

  } catch (error) {
    logger.error('Push subscription error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
},
{
  requireAuth: true,
  rateLimitRule: 'api',
  allowedMethods: ['POST'],
}
);

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export const DELETE = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;
      const body = await request.json();
    
    const { endpoint } = body;
    
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    await pushNotificationService.removeSubscription(appUserId, endpoint);

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription removed',
    });

  } catch (error) {
    logger.error('Push unsubscription error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
},
{
  requireAuth: true,
  rateLimitRule: 'api',
  allowedMethods: ['DELETE'],
}
);