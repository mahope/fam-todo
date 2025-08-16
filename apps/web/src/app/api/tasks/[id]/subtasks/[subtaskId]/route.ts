import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

async function getSessionData() {
  const session = await getServerSession(authOptions) as any;
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
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;

    const subtask = await verifySubtaskAccess(
      params.id, 
      params.subtaskId, 
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
    console.error('Get subtask error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id]/subtasks/[subtaskId] - Update a specific subtask
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    const data = await request.json();

    const subtask = await verifySubtaskAccess(
      params.id, 
      params.subtaskId, 
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
      where: { id: params.subtaskId },
      data: updateData,
    });

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error('Update subtask error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]/subtasks/[subtaskId] - Delete a specific subtask
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;

    const subtask = await verifySubtaskAccess(
      params.id, 
      params.subtaskId, 
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
      where: { id: params.subtaskId },
    });

    return NextResponse.json({ message: 'Subtask deleted successfully' });
  } catch (error) {
    console.error('Delete subtask error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}