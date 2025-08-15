import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

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

// GET /api/export - Export family data
export async function GET(request: NextRequest) {
  try {
    const { familyId, role } = await getSessionData();
    const { searchParams } = new URL(request.url);
    
    const format = searchParams.get('format') || 'json';
    const includeCompleted = searchParams.get('include_completed') === 'true';
    const includeArchived = searchParams.get('include_archived') === 'true';

    // Only admins and adults can export data
    if (role === 'CHILD') {
      return NextResponse.json(
        { error: 'Insufficient permissions to export data' },
        { status: 403 }
      );
    }

    // Get family data
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        users: {
          select: {
            id: true,
            displayName: true,
            email: true,
            role: true,
            created_at: true,
          },
        },
        folders: {
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        lists: {
          where: includeArchived ? {} : { archived: { not: true } },
          include: {
            owner: {
              select: {
                id: true,
                displayName: true,
              },
            },
            folder: {
              select: {
                id: true,
                name: true,
              },
            },
            tasks: {
              where: includeCompleted ? {} : { completed: false },
              include: {
                owner: {
                  select: {
                    id: true,
                    displayName: true,
                  },
                },
                assignee: {
                  select: {
                    id: true,
                    displayName: true,
                  },
                },
                subtasks: true,
              },
            },
            shoppingItems: true,
          },
        },
        shoppingDictionary: true,
      },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      family: {
        id: family.id,
        name: family.name,
        created_at: family.created_at,
      },
      users: family.users,
      folders: family.folders,
      lists: family.lists,
      shoppingDictionary: family.shoppingDictionary,
      metadata: {
        includeCompleted,
        includeArchived,
        totalLists: family.lists.length,
        totalTasks: family.lists.reduce((acc, list) => acc + list.tasks.length, 0),
        totalUsers: family.users.length,
      },
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(exportData);
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="famtodo-export-${family.name}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Return JSON format
      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="famtodo-export-${family.name}-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function convertToCSV(data: any): string {
  const csvLines: string[] = [];
  
  // Add headers
  csvLines.push('Type,ID,Name,Description,Status,Owner,Assignee,Created,Updated');
  
  // Add lists
  data.lists.forEach((list: any) => {
    csvLines.push([
      'List',
      list.id,
      `"${list.name}"`,
      `"${list.description || ''}"`,
      list.listType,
      `"${list.owner.displayName || ''}"`,
      '',
      list.created_at,
      list.updated_at,
    ].join(','));
    
    // Add tasks for this list
    list.tasks.forEach((task: any) => {
      csvLines.push([
        'Task',
        task.id,
        `"${task.title}"`,
        `"${task.description || ''}"`,
        task.completed ? 'Completed' : 'Active',
        `"${task.owner.displayName || ''}"`,
        `"${task.assignee?.displayName || ''}"`,
        task.created_at,
        task.updated_at,
      ].join(','));
    });
  });
  
  return csvLines.join('\n');
}