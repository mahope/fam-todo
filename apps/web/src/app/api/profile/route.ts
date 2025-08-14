import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSessionData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      familyId: true,
      avatarUrl: true,
      createdAt: true,
      lastSeen: true,
    }
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
      role_name: user.role.toLowerCase(),
      avatar_url: user.avatarUrl,
      created_at: user.createdAt.toISOString(),
      last_seen: user.lastSeen?.toISOString(),
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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        familyId: true,
        avatarUrl: true,
        createdAt: true,
        lastSeen: true,
      }
    });
    
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role_name: updatedUser.role.toLowerCase(),
      avatar_url: updatedUser.avatarUrl,
      created_at: updatedUser.createdAt.toISOString(),
      last_seen: updatedUser.lastSeen?.toISOString(),
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}