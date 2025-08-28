import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  logger.info('GET /api/lists-v2 - Starting new clean lists request');
  
  try {
    // Get session with proper type checking
    const session = await getServerSession(authOptions) as any;
    if (!session || !session.user?.id) {
      logger.warn('GET /api/lists-v2 - No valid session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    logger.info('GET /api/lists-v2 - Session found', { userId });

    // Get user data with family info
    const user = await prisma.appUser.findUnique({
      where: { id: userId },
      include: {
        family: true
      }
    });

    if (!user || !user.family) {
      logger.warn('GET /api/lists-v2 - User or family not found', { userId });
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    logger.info('GET /api/lists-v2 - User data retrieved', { 
      userId: user.id, 
      familyId: user.familyId, 
      role: user.role 
    });

    // Simple, clear query based on user role and family
    let lists;
    
    if (user.role === 'CHILD') {
      // Children see only FAMILY visibility lists and their own PRIVATE lists
      lists = await prisma.list.findMany({
        where: {
          familyId: user.familyId,
          OR: [
            { visibility: 'FAMILY' },
            { visibility: 'PRIVATE', ownerId: user.id }
          ]
        },
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
    } else {
      // Adults and Admins see all lists in their family
      lists = await prisma.list.findMany({
        where: {
          familyId: user.familyId
        },
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
    }

    logger.info('GET /api/lists-v2 - Lists retrieved successfully', { 
      count: lists.length,
      userRole: user.role 
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
      owner: list.owner,
      folder: list.folder,
      taskCount: list._count.tasks,
      // Add computed fields for easier frontend usage
      isOwner: list.ownerId === user.id,
      canEdit: list.ownerId === user.id || user.role === 'ADMIN',
      canDelete: list.ownerId === user.id || user.role === 'ADMIN'
    }));

    return NextResponse.json({
      success: true,
      lists: transformedLists,
      meta: {
        total: transformedLists.length,
        userRole: user.role,
        familyId: user.familyId
      }
    });

  } catch (error) {
    logger.error('GET /api/lists-v2 - Unexpected error:', error as any);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}