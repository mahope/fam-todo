import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const memberId = params.id;

    // Users can view their own profile, or admins can view any family member
    const canView = role === 'ADMIN' || appUserId === memberId;
    
    if (!canView) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const member = await prisma.appUser.findFirst({
      where: {
        id: memberId,
        familyId, // Ensure member belongs to same family
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        role: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            ownedLists: true,
            ownedTasks: {
              where: {
                completed: false,
              },
            },
            assignedTasks: {
              where: {
                completed: false,
              },
            },
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Get family member error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const memberId = params.id;

    // Users can edit their own profile, or admins can edit any family member
    const canEdit = role === 'ADMIN' || appUserId === memberId;
    
    if (!canEdit) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const data = await request.json();

    // Verify member exists and belongs to same family
    const existingMember = await prisma.appUser.findFirst({
      where: {
        id: memberId,
        familyId,
      },
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // Display name can be updated by user or admin
    if (data.displayName !== undefined) {
      if (typeof data.displayName === 'string') {
        updateData.displayName = data.displayName.trim() || null;
        if (updateData.displayName && updateData.displayName.length > 100) {
          return NextResponse.json({ error: 'Display name too long' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: 'Display name must be a string' }, { status: 400 });
      }
    }

    // Avatar can be updated by user or admin
    if (data.avatar !== undefined) {
      if (typeof data.avatar === 'string' || data.avatar === null) {
        updateData.avatar = data.avatar;
      } else {
        return NextResponse.json({ error: 'Avatar must be a string or null' }, { status: 400 });
      }
    }

    // Role can only be updated by admin and not on themselves unless there's another admin
    if (data.role !== undefined) {
      if (role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only admins can change roles' }, { status: 403 });
      }

      if (!['ADMIN', 'ADULT', 'CHILD'].includes(data.role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }

      // If admin is trying to demote themselves, ensure there's at least one other admin
      if (appUserId === memberId && existingMember.role === 'ADMIN' && data.role !== 'ADMIN') {
        const adminCount = await prisma.appUser.count({
          where: {
            familyId,
            role: 'ADMIN',
          },
        });

        if (adminCount <= 1) {
          return NextResponse.json({ 
            error: 'Cannot remove admin role - family must have at least one admin' 
          }, { status: 400 });
        }
      }

      updateData.role = data.role as Role;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedMember = await prisma.appUser.update({
      where: { id: memberId },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        avatar: true,
        role: true,
        created_at: true,
        updated_at: true,
        user: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            ownedLists: true,
            ownedTasks: {
              where: {
                completed: false,
              },
            },
            assignedTasks: {
              where: {
                completed: false,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Update family member error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { familyId, appUserId, role } = await getSessionData();
    const memberId = params.id;

    // Only admins can delete family members
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Verify member exists and belongs to same family
    const existingMember = await prisma.appUser.findFirst({
      where: {
        id: memberId,
        familyId,
      },
    });

    if (!existingMember) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent admin from deleting themselves if they're the only admin
    if (appUserId === memberId && existingMember.role === 'ADMIN') {
      const adminCount = await prisma.appUser.count({
        where: {
          familyId,
          role: 'ADMIN',
        },
      });

      if (adminCount <= 1) {
        return NextResponse.json({ 
          error: 'Cannot delete the only admin in the family' 
        }, { status: 400 });
      }
    }

    // Use a transaction to handle the deletion and related data
    await prisma.$transaction(async (tx) => {
      // Delete or reassign owned data
      // For now, we'll delete the user and let cascading deletes handle the rest
      // In production, you might want to reassign ownership of lists/tasks
      
      await tx.appUser.delete({
        where: { id: memberId },
      });
    });

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete family member error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}