import { NextRequest, NextResponse } from 'next/server';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

// GET /api/push/vapid - Get VAPID public key for push notifications
export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        return NextResponse.json(
          { error: 'VAPID public key not configured' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        publicKey: vapidPublicKey,
      });

    } catch (error) {
      logger.error('VAPID key error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);