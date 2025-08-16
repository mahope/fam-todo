import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { Priority, Recurrence } from '@prisma/client';

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

async function verifyTaskAccess(taskId: string, familyId: string, appUserId: string, role: string) {
  const task = await prisma.task.findFirst({
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
    include: {
      owner: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatar: true,
        },
      },
      assignee: {
        select: {
          id: true,
          displayName: true,
          email: true,
          avatar: true,
        },
      },
      list: {
        select: {
          id: true,
          name: true,
          color: true,
          listType: true,
          visibility: true,
        },
      },
      subtasks: {
        orderBy: {
          created_at: 'asc',
        },
      },
      _count: {
        select: {
          subtasks: true,
        },
      },
    },
  });

  return task;
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    const task = await verifyTaskAccess(params.id, familyId, appUserId, role);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Add computed fields
    const taskWithComputed = {
      ...task,
      isOverdue: task.deadline && task.deadline < new Date() && !task.completed,
      subtasksCompleted: task.subtasks.filter(st => st.completed).length,
      subtasksTotal: task.subtasks.length,
      subtasksProgress: task.subtasks.length > 0 
        ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 
        : 0,
    };

    return NextResponse.json(taskWithComputed);
  } catch (error) {
    console.error('Get task error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update a specific task
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    const data = await request.json();

    // Verify task exists and user has access
    const existingTask = await verifyTaskAccess(params.id, familyId, appUserId, role);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Check if user can modify this task (owner or admin)
    const canModify = existingTask.ownerId === appUserId || 
                     role === 'ADMIN' ||
                     existingTask.assigneeId === appUserId;
    
    if (!canModify) {
      return NextResponse.json(
        { error: 'Not authorized to modify this task' },
        { status: 403 }
      );
    }

    // Validate assignee belongs to same family if provided
    if (data.assigneeId && data.assigneeId !== existingTask.assigneeId) {
      const assignee = await prisma.appUser.findFirst({
        where: {
          id: data.assigneeId,
          familyId,
        },
      });

      if (!assignee) {
        return NextResponse.json(
          { error: 'Assignee not found in family' },
          { status: 400 }
        );
      }
    }

    // Validate enum values if provided
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const validRecurrences = ['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'];
    
    if (data.priority && !validPriorities.includes(data.priority)) {
      return NextResponse.json(
        { error: 'Invalid priority value' },
        { status: 400 }
      );
    }

    if (data.recurrence && !validRecurrences.includes(data.recurrence)) {
      return NextResponse.json(
        { error: 'Invalid recurrence value' },
        { status: 400 }
      );
    }

    // Validate deadline format if provided
    let deadline: Date | null = null;
    if (data.hasOwnProperty('deadline')) {
      if (data.deadline === null) {
        deadline = null;
      } else if (data.deadline) {
        deadline = new Date(data.deadline);
        if (isNaN(deadline.getTime())) {
          return NextResponse.json(
            { error: 'Invalid deadline format' },
            { status: 400 }
          );
        }
      }
    }

    // Validate tags are array of strings if provided
    let tags: string[] | undefined = undefined;
    if (data.hasOwnProperty('tags')) {
      tags = Array.isArray(data.tags) 
        ? data.tags.filter((tag: any) => typeof tag === 'string').slice(0, 10)
        : [];
    }

    // Build update data (only include provided fields)
    const updateData: any = {};
    
    if (data.hasOwnProperty('title')) updateData.title = data.title?.trim();
    if (data.hasOwnProperty('description')) updateData.description = data.description?.trim() || null;
    if (data.hasOwnProperty('assigneeId')) updateData.assigneeId = data.assigneeId;
    if (data.hasOwnProperty('completed')) updateData.completed = Boolean(data.completed);
    if (data.hasOwnProperty('priority')) updateData.priority = data.priority;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (data.hasOwnProperty('recurrence')) updateData.recurrence = data.recurrence;
    if (tags !== undefined) updateData.tags = tags;

    // Update task and handle subtasks in transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Update the task
      const updatedTask = await prisma.task.update({
        where: { id: params.id },
        data: updateData,
        include: {
          owner: {
            select: {
              id: true,
              displayName: true,
              email: true,
              avatar: true,
            },
          },
          assignee: {
            select: {
              id: true,
              displayName: true,
              email: true,
              avatar: true,
            },
          },
          list: {
            select: {
              id: true,
              name: true,
              color: true,
              listType: true,
              visibility: true,
            },
          },
          subtasks: {
            orderBy: {
              created_at: 'asc',
            },
          },
          _count: {
            select: {
              subtasks: true,
            },
          },
        },
      });

      // Handle subtasks if provided
      if (data.hasOwnProperty('subtasks') && Array.isArray(data.subtasks)) {
        // Delete existing subtasks
        await prisma.subtask.deleteMany({
          where: { taskId: params.id },
        });

        // Create new subtasks if any
        const validSubtasks = data.subtasks
          .filter((st: any) => st.title && typeof st.title === 'string')
          .slice(0, 20)
          .map((st: any) => ({
            taskId: params.id,
            title: st.title.trim(),
            completed: Boolean(st.completed),
          }));

        if (validSubtasks.length > 0) {
          await prisma.subtask.createMany({
            data: validSubtasks,
          });
        }

        // Refetch with new subtasks
        return prisma.task.findUnique({
          where: { id: params.id },
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
                email: true,
                avatar: true,
              },
            },
            assignee: {
              select: {
                id: true,
                displayName: true,
                email: true,
                avatar: true,
              },
            },
            list: {
              select: {
                id: true,
                name: true,
                color: true,
                listType: true,
                visibility: true,
              },
            },
            subtasks: {
              orderBy: {
                created_at: 'asc',
              },
            },
            _count: {
              select: {
                subtasks: true,
              },
            },
          },
        });
      }

      return updatedTask;
    });

    // Add computed fields
    const taskWithComputed = {
      ...result,
      isOverdue: result!.deadline && result!.deadline < new Date() && !result!.completed,
      subtasksCompleted: result!.subtasks.filter(st => st.completed).length,
      subtasksTotal: result!.subtasks.length,
      subtasksProgress: result!.subtasks.length > 0 
        ? (result!.subtasks.filter(st => st.completed).length / result!.subtasks.length) * 100 
        : 0,
    };

    return NextResponse.json(taskWithComputed);
  } catch (error) {
    console.error('Update task error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Update a specific task (alias for PUT)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(request, context);
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;

    // Verify task exists and user has access
    const existingTask = await verifyTaskAccess(params.id, familyId, appUserId, role);
    
    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Check if user can delete this task (owner or admin)
    const canDelete = existingTask.ownerId === appUserId || role === 'ADMIN';
    
    if (!canDelete) {
      return NextResponse.json(
        { error: 'Not authorized to delete this task' },
        { status: 403 }
      );
    }

    // Delete the task (subtasks will be deleted via CASCADE)
    await prisma.task.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}