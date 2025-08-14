import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import crypto from 'crypto';

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

    // Only admins can view all family members
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const members = await prisma.appUser.findMany({
      where: {
        familyId,
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
      orderBy: [
        { role: 'asc' }, // Admins first, then adults, then children
        { created_at: 'asc' },
      ],
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Get family members error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { familyId, appUserId, role } = await getSessionData();

    // Only admins can invite new family members
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate input
    if (!data.email || typeof data.email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const email = data.email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (!data.role || !['ADMIN', 'ADULT', 'CHILD'].includes(data.role)) {
      return NextResponse.json({ error: 'Valid role is required (ADMIN, ADULT, CHILD)' }, { status: 400 });
    }

    // Check if user is already a member of this family
    const existingMember = await prisma.appUser.findFirst({
      where: {
        familyId,
        email,
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this family' }, { status: 400 });
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await prisma.familyInvite.findFirst({
      where: {
        familyId,
        email,
        accepted: false,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return NextResponse.json({ error: 'There is already a pending invite for this email' }, { status: 400 });
    }

    // Generate unique invite token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create the invite
    const invite = await prisma.familyInvite.create({
      data: {
        familyId,
        email,
        role: data.role as Role,
        invitedBy: appUserId,
        token,
        expires_at: expiresAt,
      },
      include: {
        family: {
          select: {
            name: true,
          },
        },
        inviter: {
          select: {
            displayName: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email invitation here
    // This would typically integrate with an email service like SendGrid, SES, etc.
    console.log(`Family invite created for ${email} with token: ${token}`);

    return NextResponse.json({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
      created_at: invite.created_at,
      family: invite.family,
      inviter: invite.inviter,
    }, { status: 201 });
  } catch (error) {
    console.error('Create family invite error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}