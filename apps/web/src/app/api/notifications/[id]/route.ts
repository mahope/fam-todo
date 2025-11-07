import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/services/notifications';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

// GET /api/notifications/[id] - Get individual notification
export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;
      const resolvedParams = await params;
      const notificationId = resolvedParams.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: appUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

      return NextResponse.json(notification);
    } catch (error) {
      logger.error('Get notification error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

// PATCH /api/notifications/[id] - Mark notification as read/unread
export const PATCH = withAuth(
  async (request: NextRequest, sessionData: SessionData, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;
      const resolvedParams = await params;
      const notificationId = resolvedParams.id;
    const data = await request.json();

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: appUserId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (data.hasOwnProperty('read')) {
      updateData.read = Boolean(data.read);
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

      return NextResponse.json(updatedNotification);
    } catch (error) {
      logger.error('Update notification error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['PATCH'],
  }
);

// DELETE /api/notifications/[id] - Delete notification
export const DELETE = withAuth(
  async (request: NextRequest, sessionData: SessionData, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;
      const resolvedParams = await params;
      const notificationId = resolvedParams.id;

    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: appUserId,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

      return NextResponse.json({ success: true, message: 'Notification deleted successfully' });
    } catch (error) {
      logger.error('Delete notification error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['DELETE'],
  }
);