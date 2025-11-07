import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { familyId } = sessionData;

    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            users: true,
            lists: true,
            tasks: {
              where: {
                completed: false,
              },
            },
          },
        },
      },
    });

    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

      return NextResponse.json(family);
    } catch (error) {
      logger.error('Get family error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

export const PUT = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { familyId, role } = sessionData;

    // Only admins can update family settings
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate input
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      return NextResponse.json({ error: 'Family name is required' }, { status: 400 });
    }

    if (data.name.trim().length > 100) {
      return NextResponse.json({ error: 'Family name too long' }, { status: 400 });
    }

    const updatedFamily = await prisma.family.update({
      where: { id: familyId },
      data: {
        name: data.name.trim(),
      },
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            users: true,
            lists: true,
            tasks: {
              where: {
                completed: false,
              },
            },
          },
        },
      },
    });

      return NextResponse.json(updatedFamily);
    } catch (error) {
      logger.error('Update family error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'admin',
    allowedMethods: ['PUT'],
  }
);