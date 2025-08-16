import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";

async function getSessionData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
    throw new Error('User not found');
  }

  return { user, session };
}

export async function GET() {
  try {
    const { user } = await getSessionData();
    
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
    console.error('Get profile error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { user } = await getSessionData();
    const body = await req.json();
    
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
    console.error('Update profile error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}