import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { handleApiError, logApiSuccess } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

async function getSessionData() {
  logger.info('Starting getSessionData');
  
  const session = await getServerSession(authOptions) as any;
  logger.info('Session retrieved:', { 
    hasSession: !!session, 
    hasUser: !!session?.user,
    userId: session?.user?.id 
  });
  
  if (!session?.user?.id) {
    logger.error('No session or user ID found');
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { appUser: true },
  });
  
  logger.info('User query result:', { 
    hasUser: !!user, 
    hasAppUser: !!user?.appUser,
    familyId: user?.appUser?.familyId,
    role: user?.appUser?.role
  });

  if (!user?.appUser) {
    logger.error('App user not found for user:', session.user.id);
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
  logger.info('GET /api/lists - Starting request');
  
  try {
    const { familyId, appUserId, role } = await getSessionData();
    logger.info('Session data obtained:', { familyId, appUserId, role });

    const whereClause = {
      familyId,
      OR: [
        { visibility: 'FAMILY' },
        { visibility: 'PRIVATE', ownerId: appUserId },
        ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
      ],
    };
    
    logger.info('Database query where clause:', whereClause);

    // Optimized query with proper selection and minimal data fetching
    const lists = await prisma.list.findMany({
      where: whereClause,
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

    logger.info('Lists query result:', { 
      count: lists.length,
      listIds: lists.map(l => l.id)
    });

    return NextResponse.json(lists);
  } catch (error) {
    logger.error('GET /api/lists - Error occurred:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handleApiError(error, {
      operation: 'get_lists',
      method: 'GET'
    });
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
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handleApiError(error, {
      operation: 'create_list',
      method: 'POST'
    });
  }
}