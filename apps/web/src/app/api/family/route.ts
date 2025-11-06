import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionData } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const { familyId } = await getSessionData();

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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { familyId, role } = await getSessionData();

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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}