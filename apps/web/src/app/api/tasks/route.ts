import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { Priority, Recurrence, Visibility } from '@prisma/client';

type TaskFilterParams = {
  listId?: string;
  assignedTo?: string;
  completed?: string;
  priority?: Priority;
  hasDeadline?: string;
  overdue?: string;
  search?: string;
  tags?: string;
  sortBy?: 'created_at' | 'updated_at' | 'deadline' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  limit?: string;
  offset?: string;
};

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

function parseTaskFilters(searchParams: URLSearchParams): TaskFilterParams {
  return {
    listId: searchParams.get('listId') || undefined,
    assignedTo: searchParams.get('assignedTo') || undefined,
    completed: searchParams.get('completed') || undefined,
    priority: (searchParams.get('priority') as Priority) || undefined,
    hasDeadline: searchParams.get('hasDeadline') || undefined,
    overdue: searchParams.get('overdue') || undefined,
    search: searchParams.get('search') || undefined,
    tags: searchParams.get('tags') || undefined,
    sortBy: (searchParams.get('sortBy') as 'created_at' | 'updated_at' | 'deadline' | 'priority' | 'title') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    limit: searchParams.get('limit') || undefined,
    offset: searchParams.get('offset') || undefined,
  };
}

function buildTaskWhereClause(
  familyId: string,
  appUserId: string,
  role: string,
  filters: TaskFilterParams
) {
  const where: any = {
    familyId,
    list: {
      OR: [
        { visibility: 'FAMILY' },
        { visibility: 'PRIVATE', ownerId: appUserId },
        ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
      ],
    },
  };

  // Apply filters
  if (filters.listId) {
    where.listId = filters.listId;
  }

  if (filters.assignedTo) {
    where.assigneeId = filters.assignedTo;
  }

  if (filters.completed !== undefined) {
    where.completed = filters.completed === 'true';
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.hasDeadline === 'true') {
    where.deadline = { not: null };
  } else if (filters.hasDeadline === 'false') {
    where.deadline = null;
  }

  if (filters.overdue === 'true') {
    where.deadline = {
      lt: new Date(),
      not: null,
    };
    where.completed = false;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.tags) {
    const tagList = filters.tags.split(',').map(tag => tag.trim());
    where.tags = {
      hasSome: tagList,
    };
  }

  return where;
}

function buildTaskOrderBy(sortBy: string, sortOrder: 'asc' | 'desc') {
  const orderBy: any = {};
  
  if (sortBy === 'priority') {
    // Custom priority ordering: URGENT > HIGH > MEDIUM > LOW
    orderBy.priority = sortOrder;
  } else {
    orderBy[sortBy] = sortOrder;
  }

  return orderBy;
}

export async function GET(request: NextRequest) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const { searchParams } = new URL(request.url);
    const filters = parseTaskFilters(searchParams);

    // Build where clause with all filters
    const where = buildTaskWhereClause(familyId, appUserId, role, filters);
    
    // Build order by clause
    const orderBy = buildTaskOrderBy(filters.sortBy!, filters.sortOrder!);

    // Parse pagination
    const take = filters.limit ? parseInt(filters.limit) : 50;
    const skip = filters.offset ? parseInt(filters.offset) : 0;

    // Validate pagination limits
    if (take > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' }, 
        { status: 400 }
      );
    }

    const tasks = await prisma.task.findMany({
      where,
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
            subtasks: {
              where: { completed: false },
            },
          },
        },
      },
      orderBy,
      take,
      skip,
    });

    // Get total count for pagination
    const totalCount = await prisma.task.count({ where });

    // Add computed fields
    const tasksWithComputed = tasks.map(task => ({
      ...task,
      isOverdue: task.deadline && task.deadline < new Date() && !task.completed,
      subtasksCompleted: task.subtasks.filter(st => st.completed).length,
      subtasksTotal: task.subtasks.length,
      subtasksProgress: task.subtasks.length > 0 
        ? (task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100 
        : 0,
    }));

    return NextResponse.json({
      tasks: tasksWithComputed,
      pagination: {
        total: totalCount,
        limit: take,
        offset: skip,
        hasMore: skip + take < totalCount,
      },
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId, appUserId } = await getSessionData();
    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.listId) {
      return NextResponse.json(
        { error: 'Title and listId are required' },
        { status: 400 }
      );
    }

    // Verify the list exists and user has access
    const list = await prisma.list.findFirst({
      where: {
        id: data.listId,
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(await getSessionData()).role === 'ADULT' || (await getSessionData()).role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : [],
        ],
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    // Validate assignee belongs to same family if provided
    if (data.assigneeId) {
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

    // Validate priority and recurrence enums
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
    if (data.deadline) {
      deadline = new Date(data.deadline);
      if (isNaN(deadline.getTime())) {
        return NextResponse.json(
          { error: 'Invalid deadline format' },
          { status: 400 }
        );
      }
    }

    // Validate tags are array of strings
    const tags = Array.isArray(data.tags) 
      ? data.tags.filter((tag: any) => typeof tag === 'string').slice(0, 10) // Limit to 10 tags
      : [];

    // Create task with subtasks in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const task = await prisma.task.create({
        data: {
          title: data.title.trim(),
          description: data.description?.trim() || null,
          familyId,
          listId: data.listId,
          ownerId: appUserId,
          assigneeId: data.assigneeId || null,
          priority: data.priority || 'MEDIUM',
          deadline,
          recurrence: data.recurrence || null,
          tags,
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

      // Create subtasks if provided
      if (data.subtasks && Array.isArray(data.subtasks) && data.subtasks.length > 0) {
        const validSubtasks = data.subtasks
          .filter((st: any) => st.title && typeof st.title === 'string')
          .slice(0, 20) // Limit to 20 subtasks
          .map((st: any) => ({
            taskId: task.id,
            title: st.title.trim(),
            completed: Boolean(st.completed),
          }));

        if (validSubtasks.length > 0) {
          await prisma.subtask.createMany({
            data: validSubtasks,
          });

          // Refetch task with subtasks
          return prisma.task.findUnique({
            where: { id: task.id },
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
      }

      return task;
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

    return NextResponse.json(taskWithComputed, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}