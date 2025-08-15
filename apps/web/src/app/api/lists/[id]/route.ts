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

// GET /api/lists/[id] - Get individual list
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    const listId = params.id;

    const list = await prisma.list.findFirst({
      where: {
        id: listId,
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
        tasks: {
          where: {
            completed: false,
          },
          select: {
            id: true,
            title: true,
            completed: true,
            priority: true,
            deadline: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        shoppingItems: {
          where: {
            purchased: false,
          },
          select: {
            id: true,
            name: true,
            purchased: true,
            quantity: true,
            unit: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Get list error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/lists/[id] - Update individual list
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    const listId = params.id;
    const data = await request.json();

    // First, check if list exists and user has access
    const existingList = await prisma.list.findFirst({
      where: {
        id: listId,
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
    });

    if (!existingList) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    // Only owner or admin can modify list properties
    if (existingList.ownerId !== appUserId && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only list owner or admin can modify list' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name.trim();
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.color !== undefined) updateData.color = data.color || null;
    if (data.visibility && ['PRIVATE', 'FAMILY', 'ADULT'].includes(data.visibility)) {
      updateData.visibility = data.visibility;
    }
    if (data.folderId !== undefined) updateData.folderId = data.folderId || null;

    const updatedList = await prisma.list.update({
      where: { id: listId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Update list error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/lists/[id] - Delete individual list
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const params = await context.params;
    const listId = params.id;

    // First, check if list exists and user has access
    const existingList = await prisma.list.findFirst({
      where: {
        id: listId,
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
    });

    if (!existingList) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    // Only owner or admin can delete list
    if (existingList.ownerId !== appUserId && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only list owner or admin can delete list' },
        { status: 403 }
      );
    }

    // Delete list (cascade will handle tasks and shopping items)
    await prisma.list.delete({
      where: { id: listId },
    });

    return NextResponse.json({ success: true, message: 'List deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}