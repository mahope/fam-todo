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

export async function GET() {
  try {
    const { familyId, role } = await getSessionData();

    // Only admins can view family invites
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const invites = await prisma.familyInvite.findMany({
      where: {
        familyId,
        accepted: false, // Only show pending invites
        expires_at: {
          gt: new Date(), // Only show non-expired invites
        },
      },
      select: {
        id: true,
        email: true,
        role: true,
        expires_at: true,
        created_at: true,
        inviter: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error('Get family invites error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { familyId, role } = await getSessionData();

    // Only admins can cancel invites
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('id');

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID is required' }, { status: 400 });
    }

    // Verify invite exists and belongs to the same family
    const invite = await prisma.familyInvite.findFirst({
      where: {
        id: inviteId,
        familyId,
        accepted: false,
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found or already accepted' }, { status: 404 });
    }

    // Delete the invite
    await prisma.familyInvite.delete({
      where: { id: inviteId },
    });

    return NextResponse.json({ message: 'Invite cancelled successfully' });
  } catch (error) {
    console.error('Cancel family invite error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}