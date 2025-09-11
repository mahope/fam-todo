// Clean individual list API using unified ListService
import { NextRequest, NextResponse } from 'next/server';
import { getSessionData } from '@/lib/auth/session';
import { ListService } from '@/lib/services/lists';
import { logger } from '@/lib/logger';
import { UpdateListRequest } from '@/lib/types/list';

// GET /api/lists/[id] - Get individual list with details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { appUserId: userId, familyId, role } = await getSessionData();
    const params = await context.params;
    const listId = params.id;

    logger.info('GET /api/lists/[id]', { listId });

    const permissions = { userId, familyId, role };
    const list = await ListService.getListWithDetails(listId, permissions);

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);

  } catch (error) {
    logger.error('GET /api/lists/[id] failed', { error });
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to fetch list' },
      { status: 500 }
    );
  }
}

// PATCH /api/lists/[id] - Update individual list
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { appUserId: userId, familyId, role } = await getSessionData();
    const params = await context.params;
    const listId = params.id;
    const data: UpdateListRequest = await request.json();

    logger.info('PATCH /api/lists/[id]', { listId, data });

    // Basic validation
    if (data.name !== undefined && !data.name.trim()) {
      return NextResponse.json(
        { error: 'Validation error', message: 'List name cannot be empty', field: 'name' },
        { status: 400 }
      );
    }

    const permissions = { userId, familyId, role };
    const updatedList = await ListService.updateList(listId, data, permissions);

    return NextResponse.json(updatedList);

  } catch (error) {
    logger.error('PATCH /api/lists/[id] failed', { error });
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
      if (error.message === 'List not found or access denied') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Only list owner or admin')) {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
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
      { error: 'Internal server error', message: 'Failed to update list' },
      { status: 500 }
    );
  }
}

// DELETE /api/lists/[id] - Delete individual list
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { appUserId: userId, familyId, role } = await getSessionData();
    const params = await context.params;
    const listId = params.id;

    logger.info('DELETE /api/lists/[id]', { listId });

    const permissions = { userId, familyId, role };
    await ListService.deleteList(listId, permissions);

    return NextResponse.json({ 
      success: true, 
      message: 'List deleted successfully' 
    });

  } catch (error) {
    logger.error('DELETE /api/lists/[id] failed', { error });
    
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
      if (error.message === 'List not found or access denied') {
        return NextResponse.json(
          { error: 'Not found', message: error.message },
          { status: 404 }
        );
      }
      if (error.message.includes('Only list owner or admin')) {
        return NextResponse.json(
          { error: 'Forbidden', message: error.message },
          { status: 403 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to delete list' },
      { status: 500 }
    );
  }
}