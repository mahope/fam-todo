import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, logApiSuccess } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import { getSessionData } from '@/lib/auth/session';

export async function GET() {
  logger.info('GET /api/lists - Starting unified lists request');
  
  try {
    // Use standardized session data retrieval
    const { appUserId, familyId, role } = await getSessionData();
    logger.info('GET /api/lists - Session data retrieved', { 
      appUserId, 
      familyId, 
      role 
    });

    // Unified query based on user role - same logic as lists-v2
    const whereClause = {
      familyId,
      OR: [
        { visibility: 'FAMILY' as const },
        { visibility: 'PRIVATE' as const, ownerId: appUserId },
        ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
      ],
    };
    
    logger.info('GET /api/lists - Database query where clause:', whereClause);

    const lists = await prisma.list.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      },
      orderBy: {
        updated_at: 'desc'
      }
    });

    logger.info('GET /api/lists - Lists retrieved successfully', { 
      count: lists.length,
      userRole: role 
    });

    // Transform the data to match frontend expectations
    const transformedLists = lists.map(list => ({
      id: list.id,
      name: list.name,
      description: list.description,
      color: list.color,
      visibility: list.visibility,
      type: list.listType,
      ownerId: list.ownerId,
      familyId: list.familyId,
      folderId: list.folderId,
      createdAt: list.created_at,
      updatedAt: list.updated_at,
      owner: {
        id: list.owner.id,
        name: list.owner.displayName,
        email: list.owner.email
      },
      folder: list.folder,
      taskCount: list._count.tasks,
      // Add computed fields for easier frontend usage
      isOwner: list.ownerId === appUserId,
      canEdit: list.ownerId === appUserId || role === 'ADMIN',
      canDelete: list.ownerId === appUserId || role === 'ADMIN'
    }));

    // Return in new structured format for better error handling
    return NextResponse.json({
      success: true,
      lists: transformedLists,
      meta: {
        total: transformedLists.length,
        userRole: role,
        familyId: familyId
      }
    });

  } catch (error) {
    logger.error('GET /api/lists - Unexpected error:', error as any);
    
    // Handle authentication errors specifically
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required'
      }, { status: 401 });
    }

    if (error instanceof Error && error.message === 'App user not found') {
      return NextResponse.json({
        success: false,
        error: 'User not found',
        message: 'User not properly configured'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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