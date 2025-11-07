import { jwtVerify, SignJWT } from 'jose';
import { env } from '@/lib/env-validation';
import { logger } from '@/lib/logger';

const JWT_SECRET = new TextEncoder().encode(env.NEXTAUTH_SECRET);

export interface JWTPayload {
  sub: string; // user ID
  appUserId: string;
  familyId: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Create a JWT token
 */
export async function createJwt(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 */
export async function verifyJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    logger.error('JWT verification failed', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}

/**
 * Create a JWT token from a NextAuth session
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createJwtFromSession(session: any): Promise<string | null> {
  if (!session?.user?.id) return null;

  try {
    // Get user data with app user info
    const { prisma } = await import('@/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { appUser: true },
    });

    if (!user?.appUser) return null;

    return createJwt({
      sub: user.id,
      appUserId: user.appUser.id,
      familyId: user.appUser.familyId,
      role: user.appUser.role,
    });
  } catch (error) {
    logger.error('Error creating JWT from session', { error: error instanceof Error ? error.message : String(error) });
    return null;
  }
}