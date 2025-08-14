import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

async function getSessionData() {
  const session = await getServerSession();
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
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();

    // Verify task exists and user has access
    const task = await verifyTaskAccess(params.id, familyId, appUserId, role);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId: params.id },
      orderBy: { created_at: 'asc' },
    });

    return NextResponse.json(subtasks);
  } catch (error) {
    console.error('Get subtasks error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks/[id]/subtasks - Create a new subtask
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const data = await request.json();

    // Verify task exists and user has access
    const task = await verifyTaskAccess(params.id, familyId, appUserId, role);
    
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
      where: { taskId: params.id },
    });

    if (subtaskCount >= 20) {
      return NextResponse.json(
        { error: 'Maximum 20 subtasks allowed per task' },
        { status: 400 }
      );
    }

    const subtask = await prisma.subtask.create({
      data: {
        taskId: params.id,
        title: data.title.trim(),
        completed: Boolean(data.completed),
      },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.error('Create subtask error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}