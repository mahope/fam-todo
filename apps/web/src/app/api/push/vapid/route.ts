import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// GET /api/push/vapid - Get VAPID public key for push notifications
export async function GET() {
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
}