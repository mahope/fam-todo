import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

// GET /api/settings - Get user settings
export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;

    let settings = await prisma.userSetting.findUnique({
      where: { userId: appUserId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSetting.create({
        data: {
          userId: appUserId,
        },
      });
    }

      return NextResponse.json(settings);
    } catch (error) {
      logger.error('Get settings error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

// PATCH /api/settings - Update user settings
export const PATCH = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { appUserId } = sessionData;
    const data = await request.json();

    // Validate settings data
    const updateData: any = {};

    if (data.theme && ['system', 'light', 'dark'].includes(data.theme)) {
      updateData.theme = data.theme;
    }

    if (data.locale && ['da', 'en'].includes(data.locale)) {
      updateData.locale = data.locale;
    }

    if (data.timezone && typeof data.timezone === 'string') {
      updateData.timezone = data.timezone;
    }

    if (data.dateFormat && typeof data.dateFormat === 'string') {
      updateData.dateFormat = data.dateFormat;
    }

    if (data.hasOwnProperty('notificationsEnabled')) {
      updateData.notificationsEnabled = Boolean(data.notificationsEnabled);
    }

    if (data.hasOwnProperty('emailNotifications')) {
      updateData.emailNotifications = Boolean(data.emailNotifications);
    }

    if (data.hasOwnProperty('pushNotifications')) {
      updateData.pushNotifications = Boolean(data.pushNotifications);
    }

    if (data.hasOwnProperty('taskReminders')) {
      updateData.taskReminders = Boolean(data.taskReminders);
    }

    if (data.hasOwnProperty('familyUpdates')) {
      updateData.familyUpdates = Boolean(data.familyUpdates);
    }

    if (data.defaultListVisibility && ['PRIVATE', 'FAMILY', 'ADULT'].includes(data.defaultListVisibility)) {
      updateData.defaultListVisibility = data.defaultListVisibility;
    }

    // Upsert settings
    const settings = await prisma.userSetting.upsert({
      where: { userId: appUserId },
      update: updateData,
      create: {
        userId: appUserId,
        ...updateData,
      },
    });

      return NextResponse.json(settings);
    } catch (error) {
      logger.error('Update settings error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['PATCH'],
  }
);