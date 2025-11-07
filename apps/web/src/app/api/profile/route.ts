import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, SessionData } from '@/lib/security/auth-middleware';
import { logger } from '@/lib/logger';

export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { userId } = sessionData;

    // Fetch user with family details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        appUser: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role_name: user.appUser?.role.toLowerCase() || 'adult',
      avatar_url: user.appUser?.avatar || null,
      created_at: user.appUser?.created_at.toISOString() || new Date().toISOString(),
      family: user.appUser?.family || null,
    });
    } catch (error) {
      logger.error('Get profile error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

export const PATCH = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      const { userId } = sessionData;

    // Fetch user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        appUser: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

      const body = await request.json();

      const { name, email } = body;

      if (!name || !email) {
        return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: user.id }
        }
      });

      if (existingUser) {
        return NextResponse.json({ error: 'Email er allerede i brug' }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { name, email },
      include: {
        appUser: {
          include: {
            family: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    
      return NextResponse.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role_name: updatedUser.appUser?.role.toLowerCase() || 'adult',
        avatar_url: updatedUser.appUser?.avatar || null,
        created_at: updatedUser.appUser?.created_at.toISOString() || new Date().toISOString(),
        family: updatedUser.appUser?.family || null,
      });
    } catch (error) {
      logger.error('Update profile error', { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['PATCH'],
  }
);