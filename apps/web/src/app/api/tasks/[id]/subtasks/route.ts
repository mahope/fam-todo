import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

async function verifyTaskAccess(taskId: string, familyId: string, appUserId: string, role: string) {
  return prisma.task.findFirst({
    where: {
      id: taskId,
      familyId,
      list: {
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
    },
  });
}

// GET /api/tasks/[id]/subtasks - Get subtasks for a specific task
export const GET = withAuth(
  async (
    request: NextRequest,
    sessionData: SessionData,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    try {
      const { familyId, appUserId, role } = sessionData;
      const resolvedParams = await params;

      // Verify task exists and user has access
      const task = await verifyTaskAccess(resolvedParams.id, familyId, appUserId, role);

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found or access denied' },
          { status: 404 }
        );
      }

      const subtasks = await prisma.subtask.findMany({
        where: { taskId: resolvedParams.id },
        orderBy: { created_at: 'asc' },
      });

      return NextResponse.json(subtasks);
    } catch (error) {
      logger.error('Get subtasks error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

// POST /api/tasks/[id]/subtasks - Create a new subtask
export const POST = withAuth(
  async (
    request: NextRequest,
    sessionData: SessionData,
    { params }: { params: Promise<{ id: string }> }
  ): Promise<NextResponse> => {
    try {
      const { familyId, appUserId, role } = sessionData;
      const resolvedParams = await params;
      const data = await request.json();

      // Verify task exists and user has access
      const task = await verifyTaskAccess(resolvedParams.id, familyId, appUserId, role);

      if (!task) {
        return NextResponse.json(
          { error: 'Task not found or access denied' },
          { status: 404 }
        );
      }

      // Check if user can modify this task (owner, assignee, or admin)
      const canModify = task.ownerId === appUserId ||
                       role === 'ADMIN' ||
                       task.assigneeId === appUserId;

      if (!canModify) {
        return NextResponse.json(
          { error: 'Not authorized to modify this task' },
          { status: 403 }
        );
      }

      // Validate required fields
      if (!data.title) {
        return NextResponse.json(
          { error: 'Title is required' },
          { status: 400 }
        );
      }

      // Check subtask limit
      const subtaskCount = await prisma.subtask.count({
        where: { taskId: resolvedParams.id },
      });

      if (subtaskCount >= 20) {
        return NextResponse.json(
          { error: 'Maximum 20 subtasks allowed per task' },
          { status: 400 }
        );
      }

      const subtask = await prisma.subtask.create({
        data: {
          taskId: resolvedParams.id,
          title: data.title.trim(),
          completed: Boolean(data.completed),
        },
      });

      return NextResponse.json(subtask, { status: 201 });
    } catch (error) {
      logger.error('Create subtask error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['POST'],
  }
);
