import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { RecurringTaskService, RepeatRuleData } from '@/lib/services/recurring-tasks';

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
      repeatRule: true,
    },
  });

  return task;
}

// GET /api/tasks/[id]/repeat - Get repeat rule for task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const task = await verifyTaskAccess(params.id, familyId, appUserId, role);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    if (!task.repeatRule) {
      return NextResponse.json(null);
    }

    return NextResponse.json(task.repeatRule);
  } catch (error) {
    console.error('Get repeat rule error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/tasks/[id]/repeat - Create repeat rule for task
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const data = await request.json();
    const taskId = params.id;

    // Verify task exists and user has access
    const task = await verifyTaskAccess(taskId, familyId, appUserId, role);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    // Check if user can modify this task (owner or admin)
    const canModify = task.ownerId === appUserId || 
                     role === 'ADMIN' ||
                     task.assigneeId === appUserId;
    
    if (!canModify) {
      return NextResponse.json(
        { error: 'Not authorized to modify this task' },
        { status: 403 }
      );
    }

    // Check if repeat rule already exists
    if (task.repeatRule) {
      return NextResponse.json(
        { error: 'Task already has a repeat rule. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Validate repeat rule data
    if (!data.type || !['DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM'].includes(data.type)) {
      return NextResponse.json(
        { error: 'Invalid recurrence type' },
        { status: 400 }
      );
    }

    const ruleData: RepeatRuleData = {
      type: data.type,
      interval: data.interval || 1,
      daysOfWeek: data.daysOfWeek || [],
      dayOfMonth: data.dayOfMonth,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      maxOccurrences: data.maxOccurrences,
      skipWeekends: data.skipWeekends || false,
    };

    // Create repeat rule
    const repeatRule = await RecurringTaskService.createRepeatRule(taskId, ruleData);

    // Generate initial occurrences
    await RecurringTaskService.generateOccurrences(taskId);

    return NextResponse.json(repeatRule, { status: 201 });
  } catch (error) {
    console.error('Create repeat rule error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/tasks/[id]/repeat - Update repeat rule for task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const data = await request.json();
    const taskId = params.id;

    // Verify task exists and user has access
    const task = await verifyTaskAccess(taskId, familyId, appUserId, role);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    if (!task.repeatRule) {
      return NextResponse.json(
        { error: 'Task does not have a repeat rule. Use POST to create.' },
        { status: 404 }
      );
    }

    // Check if user can modify this task
    const canModify = task.ownerId === appUserId || 
                     role === 'ADMIN' ||
                     task.assigneeId === appUserId;
    
    if (!canModify) {
      return NextResponse.json(
        { error: 'Not authorized to modify this task' },
        { status: 403 }
      );
    }

    const ruleData: Partial<RepeatRuleData> = {};
    
    if (data.type) ruleData.type = data.type;
    if (data.interval !== undefined) ruleData.interval = data.interval;
    if (data.daysOfWeek !== undefined) ruleData.daysOfWeek = data.daysOfWeek;
    if (data.dayOfMonth !== undefined) ruleData.dayOfMonth = data.dayOfMonth;
    if (data.endDate !== undefined) ruleData.endDate = data.endDate ? new Date(data.endDate) : undefined;
    if (data.maxOccurrences !== undefined) ruleData.maxOccurrences = data.maxOccurrences;
    if (data.skipWeekends !== undefined) ruleData.skipWeekends = data.skipWeekends;

    // Update repeat rule
    const updatedRule = await RecurringTaskService.updateRepeatRule(taskId, ruleData);

    // Regenerate future occurrences
    await prisma.taskOccurrence.deleteMany({
      where: {
        taskId,
        occurrenceDate: { gte: new Date() },
        completed: false,
      },
    });
    
    await RecurringTaskService.generateOccurrences(taskId);

    return NextResponse.json(updatedRule);
  } catch (error) {
    console.error('Update repeat rule error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id]/repeat - Delete repeat rule and stop recurring
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const taskId = params.id;

    // Verify task exists and user has access
    const task = await verifyTaskAccess(taskId, familyId, appUserId, role);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found or access denied' },
        { status: 404 }
      );
    }

    if (!task.repeatRule) {
      return NextResponse.json(
        { error: 'Task does not have a repeat rule' },
        { status: 404 }
      );
    }

    // Check if user can modify this task
    const canModify = task.ownerId === appUserId || role === 'ADMIN';
    
    if (!canModify) {
      return NextResponse.json(
        { error: 'Not authorized to modify this task' },
        { status: 403 }
      );
    }

    // Delete repeat rule and future occurrences
    await RecurringTaskService.deleteRepeatRule(taskId);

    return NextResponse.json({ success: true, message: 'Repeat rule deleted successfully' });
  } catch (error) {
    console.error('Delete repeat rule error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}