import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import crypto from 'crypto';
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { familyId, role } = sessionData;

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
      logger.error('Get family members error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'admin',
    allowedMethods: ['GET'],
  }
);

export const POST = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { familyId, appUserId, role } = sessionData;

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

    /* 
     * FUTURE ENHANCEMENT: Email invitation system
     * When implemented, this should:
     * 1. Send invitation email using configured email service (SendGrid/SES)
     * 2. Include invite URL with token: /invite?token=${token}
     * 3. Set expiration reminder emails
     * 4. Log email delivery status
     */

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
      logger.error('Create family invite error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'admin',
    allowedMethods: ['POST'],
  }
);