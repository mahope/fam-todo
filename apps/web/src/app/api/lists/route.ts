// Clean API routes using unified ListService
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { ListService } from '@/lib/services/lists';
import { logger } from '@/lib/logger';
import {
  isListError,
  CreateListRequest,
  ListQueryOptions
} from '@/lib/types/list';

export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    logger.info('GET /api/lists');

    try {
      const { appUserId: userId, familyId, role } = sessionData;
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const options: ListQueryOptions = {
      listType: searchParams.get('listType') as 'TODO' | 'SHOPPING' || undefined,
      folderId: searchParams.get('folderId') || undefined,
      visibility: searchParams.get('visibility') as 'PRIVATE' | 'FAMILY' | 'ADULT' || undefined,
      search: searchParams.get('search') || undefined,
      orderBy: searchParams.get('orderBy') as 'name' | 'created_at' | 'updated_at' || 'updated_at',
      orderDirection: searchParams.get('orderDirection') as 'asc' | 'desc' || 'desc',
    };

    const permissions = { userId, familyId, role };
    const lists = await ListService.getLists(permissions, options);

    return NextResponse.json({
      lists,
      meta: {
        total: lists.length,
        userRole: role,
        familyId,
      },
    });

    } catch (error) {
      logger.error('GET /api/lists failed', { error });

      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required' },
            { status: 401 }
          );
        }
        if (error.message === 'App user not found') {
          return NextResponse.json(
            { error: 'User not found', message: 'User not properly configured' },
            { status: 404 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Internal server error', message: 'Failed to fetch lists' },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

export const POST = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    logger.info('POST /api/lists');

    try {
      const { appUserId: userId, familyId, role } = sessionData;
    const data: CreateListRequest = await request.json();

    // Basic validation
    if (!data.name?.trim()) {
      return NextResponse.json(
        { error: 'Validation error', message: 'List name is required', field: 'name' },
        { status: 400 }
      );
    }

    const permissions = { userId, familyId, role };
    const list = await ListService.createList(data, permissions);

      return NextResponse.json(list, { status: 201 });

    } catch (error) {
      logger.error('POST /api/lists failed', { error });

      if (error instanceof Error) {
        if (error.message === 'Unauthorized') {
          return NextResponse.json(
            { error: 'Unauthorized', message: 'Authentication required' },
            { status: 401 }
          );
        }
        if (error.message.includes('Folder not found')) {
          return NextResponse.json(
            { error: 'Validation error', message: error.message, field: 'folderId' },
            { status: 400 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Internal server error', message: 'Failed to create list' },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['POST'],
  }
);