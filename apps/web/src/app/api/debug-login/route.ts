import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { appUser: true },
    });

    const debug = {
      email: email.toLowerCase(),
      userFound: !!user,
      userId: user?.id,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length,
      appUserExists: !!user?.appUser,
      appUserId: user?.appUser?.id,
      familyId: user?.appUser?.familyId,
      role: user?.appUser?.role,
    };

    // Test password verification if user exists
    let passwordValid = false;
    let passwordError = null;
    if (user?.password) {
      try {
        passwordValid = await verifyPassword(password, user.password);
      } catch (error) {
        passwordError = error instanceof Error ? error.message : 'Unknown error';
      }
    }

    debug.passwordValid = passwordValid;
    debug.passwordError = passwordError;

    return NextResponse.json({
      debug,
      message: 'Login debug information',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Debug failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to debug login',
    instructions: 'Send a POST request with { "email": "user@example.com", "password": "password" }',
  });
}