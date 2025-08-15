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

// GET /api/folders - Get all folders for the family
export async function GET() {
  try {
    const { familyId, appUserId, role } = await getSessionData();

    const folders = await prisma.folder.findMany({
      where: {
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            lists: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const { familyId, appUserId } = await getSessionData();
    const data = await request.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name: data.name.trim(),
        color: data.color || null,
        familyId,
        ownerId: appUserId,
        visibility: data.visibility || 'FAMILY',
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            lists: true,
          },
        },
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Create folder error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}