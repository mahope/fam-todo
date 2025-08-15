import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

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

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const { appUserId } = await getSessionData();

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
    console.error('Get settings error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/settings - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const { appUserId } = await getSessionData();
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
    console.error('Update settings error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}