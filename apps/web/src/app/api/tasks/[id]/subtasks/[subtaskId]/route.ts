import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

async function verifySubtaskAccess(
  taskId: string,
  subtaskId: string,
  familyId: string,
  appUserId: string,
  role: string
) {
  const subtask = await prisma.subtask.findFirst({
    where: {
      id: subtaskId,
      taskId,
      task: {
        familyId,
        list: {
          OR: [
            { visibility: 'FAMILY' },
            { visibility: 'PRIVATE', ownerId: appUserId },
            ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
          ],
        },
      },
    },
    include: {
      task: {
        select: {
          id: true,
          ownerId: true,
          assigneeId: true,
        },
      },
    },
  });

  return subtask;
}

// GET /api/tasks/[id]/subtasks/[subtaskId] - Get a specific subtask
export const GET = withAuth(
  async (
    request: NextRequest,
    sessionData: SessionData,
    { params }: { params: Promise<{ id: string; subtaskId: string }> }
  ): Promise<NextResponse> => {
    try {
      const { familyId, appUserId, role } = sessionData;
      const resolvedParams = await params;

      const subtask = await verifySubtaskAccess(
        resolvedParams.id,
        resolvedParams.subtaskId,
        familyId,
        appUserId,
        role
      );

      if (!subtask) {
        return NextResponse.json(
          { error: 'Subtask not found or access denied' },
          { status: 404 }
        );
      }

      // Remove task details from response
      const { task, ...subtaskData } = subtask;

      return NextResponse.json(subtaskData);
    } catch (error) {
      logger.error('Get subtask error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

// PATCH /api/tasks/[id]/subtasks/[subtaskId] - Update a specific subtask
export const PATCH = withAuth(
  async (
    request: NextRequest,
    sessionData: SessionData,
    { params }: { params: Promise<{ id: string; subtaskId: string }> }
  ): Promise<NextResponse> => {
    try {
      const { familyId, appUserId, role } = sessionData;
      const resolvedParams = await params;
      const data = await request.json();

      const subtask = await verifySubtaskAccess(
        resolvedParams.id,
        resolvedParams.subtaskId,
        familyId,
        appUserId,
        role
      );

      if (!subtask) {
        return NextResponse.json(
          { error: 'Subtask not found or access denied' },
          { status: 404 }
        );
      }

      // Check if user can modify this subtask (task owner, assignee, or admin)
      const canModify = subtask.task.ownerId === appUserId ||
                       role === 'ADMIN' ||
                       subtask.task.assigneeId === appUserId;

      if (!canModify) {
        return NextResponse.json(
          { error: 'Not authorized to modify this subtask' },
          { status: 403 }
        );
      }

      // Build update data (only include provided fields)
      const updateData: any = {};

      if (data.hasOwnProperty('title')) {
        if (!data.title || typeof data.title !== 'string') {
          return NextResponse.json(
            { error: 'Title is required and must be a string' },
            { status: 400 }
          );
        }
        updateData.title = data.title.trim();
      }

      if (data.hasOwnProperty('completed')) {
        updateData.completed = Boolean(data.completed);
      }

      const updatedSubtask = await prisma.subtask.update({
        where: { id: resolvedParams.subtaskId },
        data: updateData,
      });

      return NextResponse.json(updatedSubtask);
    } catch (error) {
      logger.error('Update subtask error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['PATCH'],
  }
);

// PUT is an alias for PATCH
export const PUT = PATCH;

// DELETE /api/tasks/[id]/subtasks/[subtaskId] - Delete a specific subtask
export const DELETE = withAuth(
  async (
    request: NextRequest,
    sessionData: SessionData,
    { params }: { params: Promise<{ id: string; subtaskId: string }> }
  ): Promise<NextResponse> => {
    try {
      const { familyId, appUserId, role } = sessionData;
      const resolvedParams = await params;

      const subtask = await verifySubtaskAccess(
        resolvedParams.id,
        resolvedParams.subtaskId,
        familyId,
        appUserId,
        role
      );

      if (!subtask) {
        return NextResponse.json(
          { error: 'Subtask not found or access denied' },
          { status: 404 }
        );
      }

      // Check if user can delete this subtask (task owner or admin)
      const canDelete = subtask.task.ownerId === appUserId || role === 'ADMIN';

      if (!canDelete) {
        return NextResponse.json(
          { error: 'Not authorized to delete this subtask' },
          { status: 403 }
        );
      }

      await prisma.subtask.delete({
        where: { id: resolvedParams.subtaskId },
      });

      return NextResponse.json({ message: 'Subtask deleted successfully' });
    } catch (error) {
      logger.error('Delete subtask error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['DELETE'],
  }
);
