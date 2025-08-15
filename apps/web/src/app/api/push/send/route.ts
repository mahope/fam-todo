import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { pushNotificationService, NotificationPayload } from '@/lib/services/push-notifications';

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

// POST /api/push/send - Send push notification (admin/testing only)
export async function POST(request: NextRequest) {
  try {
    const { appUserId, familyId, role } = await getSessionData();
    
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
    console.error('Push send error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}