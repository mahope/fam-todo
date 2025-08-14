import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email og password er påkrævet' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bruger med denne email eksisterer allerede' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
      },
    });

    // Create family
    const familyName = `${name || email.split('@')[0]}'s Familie`;
    const family = await prisma.family.create({
      data: {
        name: familyName,
      },
    });

    // Create app_user
    const appUser = await prisma.appUser.create({
      data: {
        userId: user.id,
        familyId: family.id,
        role: 'ADMIN',
        email: user.email,
        displayName: user.name,
      },
    });

    return NextResponse.json({
      message: 'Bruger oprettet succesfuldt',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        appUserId: appUser.id,
        familyId: family.id,
        role: appUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Der opstod en fejl ved oprettelse af bruger' },
      { status: 500 }
    );
  }
}