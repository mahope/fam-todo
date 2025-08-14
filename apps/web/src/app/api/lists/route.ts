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

export async function GET() {
  try {
    const { familyId, appUserId, role } = await getSessionData();

    // Optimized query with proper selection and minimal data fetching
    const lists = await prisma.list.findMany({
      where: {
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        visibility: true,
        listType: true,
        created_at: true,
        updated_at: true,
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: {
              where: {
                completed: false, // Only count incomplete tasks
              },
            },
          },
        },
      },
      orderBy: {
        updated_at: 'desc', // Show recently updated lists first
      },
      take: 50, // Limit results for better performance
    });

    return NextResponse.json(lists);
  } catch (error) {
    console.error('Get lists error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId, appUserId } = await getSessionData();
    const data = await request.json();

    const list = await prisma.list.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        familyId,
        ownerId: appUserId,
        folderId: data.folderId || null,
        visibility: data.visibility || 'FAMILY',
        listType: data.listType || 'TODO',
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error('Create list error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}