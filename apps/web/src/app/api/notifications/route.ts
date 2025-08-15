import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/services/notifications';

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

// GET /api/notifications - Get notifications for the current user
export async function GET(request: NextRequest) {
  try {
    const { appUserId } = await getSessionData();
    const { searchParams } = new URL(request.url);
    
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const notifications = await NotificationService.getForUser(appUserId, {
      unreadOnly,
      limit,
      offset,
    });

    const unreadCount = await NotificationService.getUnreadCount(appUserId);

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: {
        limit,
        offset,
        hasMore: notifications.length === limit,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const { familyId, role } = await getSessionData();
    const data = await request.json();

    // Only admins can create manual notifications
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admins can create notifications' },
        { status: 403 }
      );
    }

    if (!data.title || !data.message || !data.userId) {
      return NextResponse.json(
        { error: 'Title, message, and userId are required' },
        { status: 400 }
      );
    }

    // Verify target user is in the same family
    const targetUser = await prisma.appUser.findFirst({
      where: {
        id: data.userId,
        familyId,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found in family' },
        { status: 404 }
      );
    }

    const notification = await NotificationService.create({
      type: data.type || 'FAMILY_INVITE',
      title: data.title,
      message: data.message,
      entityType: data.entityType,
      entityId: data.entityId,
      sendAt: data.sendAt ? new Date(data.sendAt) : undefined,
      familyId,
      userId: data.userId,
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Create notification error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}