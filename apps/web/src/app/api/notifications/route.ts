import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/services/notifications';
import { getSessionData } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

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
    logger.error('Get notifications error', { error: error instanceof Error ? error.message : String(error) });
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
    logger.error('Create notification error', { error: error instanceof Error ? error.message : String(error) });
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}