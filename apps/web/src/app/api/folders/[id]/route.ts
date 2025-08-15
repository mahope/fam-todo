import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api-error-handler';

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

// GET /api/folders/[id] - Get individual folder
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const folderId = params.id;

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
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
          },
        },
        lists: {
          where: {
            OR: [
              { visibility: 'FAMILY' },
              { visibility: 'PRIVATE', ownerId: appUserId },
              ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
            ],
          },
          include: {
            _count: {
              select: {
                tasks: {
                  where: { completed: false },
                },
              },
            },
          },
        },
        _count: {
          select: {
            lists: true,
          },
        },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(folder);
  } catch (error) {
    return handleApiError(error, { operation: 'get_folder', folderId: params.id });
  }
}

// PATCH /api/folders/[id] - Update individual folder
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const folderId = params.id;
    const data = await request.json();

    // Check if folder exists and user has access
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found or access denied' },
        { status: 404 }
      );
    }

    // Only owner or admin can modify folder
    if (existingFolder.ownerId !== appUserId && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only folder owner or admin can modify folder' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.name) updateData.name = data.name.trim();
    if (data.color !== undefined) updateData.color = data.color || null;
    if (data.visibility && ['PRIVATE', 'FAMILY', 'ADULT'].includes(data.visibility)) {
      updateData.visibility = data.visibility;
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            lists: true,
          },
        },
      },
    });

    return NextResponse.json(updatedFolder);
    logger.info('Folder updated', { folderId, updateData, ownerId: appUserId });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    return handleApiError(error, { operation: 'update_folder', folderId: params.id });
  }
}

// DELETE /api/folders/[id] - Delete individual folder
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const folderId = params.id;

    // Check if folder exists and user has access
    const existingFolder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        familyId,
        OR: [
          { visibility: 'FAMILY' },
          { visibility: 'PRIVATE', ownerId: appUserId },
          ...(role === 'ADULT' || role === 'ADMIN' ? [{ visibility: 'ADULT' as const }] : []),
        ],
      },
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found or access denied' },
        { status: 404 }
      );
    }

    // Only owner or admin can delete folder
    if (existingFolder.ownerId !== appUserId && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only folder owner or admin can delete folder' },
        { status: 403 }
      );
    }

    // Check if folder has lists
    const listCount = await prisma.list.count({
      where: { folderId },
    });

    if (listCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete folder that contains lists. Please move or delete lists first.' },
        { status: 400 }
      );
    }

    // Delete folder
    await prisma.folder.delete({
      where: { id: folderId },
    });

    return NextResponse.json({ success: true, message: 'Folder deleted successfully' });
    logger.info('Folder deleted', { folderId, ownerId: appUserId });

    return NextResponse.json({ success: true, message: 'Folder deleted successfully' });
  } catch (error) {
    return handleApiError(error, { operation: 'delete_folder', folderId: params.id });
  }
}