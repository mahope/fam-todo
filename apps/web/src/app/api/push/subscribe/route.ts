import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { pushNotificationService } from '@/lib/services/push-notifications';

async function getSessionData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { appUser: true },
  });

  if (!user?.appUser) {
    throw new Error('App user not found');
  }

  return {
    userId: user.id,
    appUserId: user.appUser.id,
    familyId: user.appUser.familyId,
    role: user.appUser.role,
  };
}

// POST /api/push/subscribe - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const { appUserId } = await getSessionData();
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
    console.error('Push subscription error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/push/subscribe - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const { appUserId } = await getSessionData();
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
    console.error('Push unsubscription error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}