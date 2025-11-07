import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import type { Role } from '@prisma/client';

export interface SessionData {
  userId: string;
  appUserId: string;
  familyId: string;
  role: Role;
  email: string;
  displayName: string;
}

/**
 * Standardized session data retrieval for all API routes
 * This ensures consistent authentication and user data fetching across the application
 */
export async function getSessionData(): Promise<SessionData> {
  try {
    logger.info('getSessionData: Starting session retrieval');
    
    const session = await getServerSession(authOptions) as any;
    logger.info('getSessionData: Session retrieved', { 
      hasSession: !!session, 
      hasUser: !!session?.user,
      userId: session?.user?.id 
    });
    
    if (!session?.user?.id) {
      logger.warn('getSessionData: No valid session found');
      throw new Error('Unauthorized');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { appUser: true },
    });
    
    logger.info('getSessionData: User query result', { 
      hasUser: !!user, 
      hasAppUser: !!user?.appUser,
      familyId: user?.appUser?.familyId,
      role: user?.appUser?.role
    });

    if (!user?.appUser) {
      logger.error('getSessionData: App user not found for user', { userId: session.user.id });
      throw new Error('App user not found');
    }

    const sessionData: SessionData = {
      userId: user.id,
      appUserId: user.appUser.id,
      familyId: user.appUser.familyId,
      role: user.appUser.role,
      email: user.appUser.email,
      displayName: user.name || user.appUser.email.split('@')[0],
    };

    logger.info('getSessionData: Session data prepared successfully', sessionData);
    return sessionData;

  } catch (error) {
    logger.error('getSessionData: Error occurred', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
}

/**
 * Lightweight session check that only validates authentication
 * Use this when you only need to check if the user is authenticated
 */
export async function validateSession(): Promise<{ userId: string; email: string }> {
  const session = await getServerSession(authOptions) as any;
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return {
    userId: session.user.id,
    email: session.user.email,
  };
}

/**
 * Get user role for authorization checks
 * Returns the user's role or throws if unauthorized
 */
export async function getUserRole(): Promise<Role> {
  const sessionData = await getSessionData();
  return sessionData.role;
}

/**
 * Check if user has required role
 * @param requiredRole - The minimum role required
 * @param userRole - The user's current role (optional, will be fetched if not provided)
 */
export async function hasRequiredRole(requiredRole: Role, userRole?: Role): Promise<boolean> {
  const role = userRole || await getUserRole();
  
  // Role hierarchy: ADMIN > ADULT > CHILD
  const roleHierarchy = {
    'CHILD': 0,
    'ADULT': 1,
    'ADMIN': 2
  };
  
  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}