import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

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

// POST /api/family/invites - Create new family invite
export async function POST(request: NextRequest) {
  try {
    const { appUserId, familyId, role } = await getSessionData();
    
    if (role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only administrators can send family invites' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role: inviteRole = 'ADULT', expiresInHours = 72 } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!['ADMIN', 'ADULT', 'CHILD'].includes(inviteRole)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists in this family
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        appUser: {
          familyId,
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User is already a member of this family' },
        { status: 400 }
      );
    }

    // Check for existing pending invite
    const existingInvite = await prisma.familyInvite.findFirst({
      where: {
        email,
        familyId,
        accepted: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: 'There is already a pending invite for this email' },
        { status: 400 }
      );
    }

    // Get family info
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      select: { name: true },
    });

    if (!family) {
      return NextResponse.json(
        { error: 'Family not found' },
        { status: 404 }
      );
    }

    // Create invite
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const invite = await prisma.familyInvite.create({
      data: {
        email,
        role: inviteRole,
        token: uuidv4(),
        familyId,
        inviterId: appUserId,
        expires_at: expiresAt,
        accepted: false,
      },
      include: {
        inviter: {
          select: {
            displayName: true,
          },
        },
        family: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        accepted: invite.accepted,
        expires_at: invite.expires_at,
        inviter: invite.inviter,
        family: invite.family,
      },
      message: 'Family invite sent successfully',
    });

  } catch (error) {
    console.error('Create family invite error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}