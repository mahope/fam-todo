// Authentication and authorization middleware
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from './rate-limiter';
import { SecurityHeaders } from './input-validation';
import { logger } from '@/lib/logger';

// Session data interface
export interface SessionData {
  userId: string;
  appUserId: string;
  familyId: string;
  role: 'ADMIN' | 'ADULT' | 'CHILD';
  email: string;
  displayName: string;
}

// Authorization options
export interface AuthOptions {
  requireAuth?: boolean;
  requiredRoles?: ('ADMIN' | 'ADULT' | 'CHILD')[];
  rateLimitRule?: 'auth' | 'api' | 'upload' | 'search' | 'admin';
  requireSameFamily?: boolean;
  allowedMethods?: string[];
}

// Get and validate session data
export async function getSessionData(): Promise<SessionData> {
  const session = await getServerSession(authOptions) as any;
  
  if (!session?.user?.id) {
    throw new AuthenticationError('No valid session found');
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

  if (!user?.appUser) {
    throw new AuthenticationError('User not found or not properly configured');
  }

  return {
    userId: user.id,
    appUserId: user.appUser.id,
    familyId: user.appUser.familyId,
    role: user.appUser.role,
    email: user.email || '',
    displayName: user.appUser.displayName || '',
  };
}

// Custom error classes
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class RateLimitError extends Error {
  public resetTime: string;
  
  constructor(message: string, resetTime: string) {
    super(message);
    this.name = 'RateLimitError';
    this.resetTime = resetTime;
  }
}

// Check if user has required role
export function hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
  if (!requiredRoles.length) return true;
  
  // Role hierarchy: ADMIN > ADULT > CHILD
  const roleHierarchy = { 'ADMIN': 3, 'ADULT': 2, 'CHILD': 1 };
  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  
  return requiredRoles.some(role => {
    const requiredLevel = roleHierarchy[role as keyof typeof roleHierarchy] || 0;
    return userLevel >= requiredLevel;
  });
}

// Middleware wrapper for API routes
export function withAuth<T extends any[]>(
  handler: (request: NextRequest, sessionData: SessionData, ...args: T) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async function authMiddleware(
    request: NextRequest, 
    ...args: T
  ): Promise<NextResponse> {
    try {
      // Add security headers
      const headers = new Headers(SecurityHeaders);
      
      // Check HTTP method
      if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
        return NextResponse.json(
          { error: `Method ${request.method} not allowed` },
          { status: 405, headers }
        );
      }
      
      // Rate limiting check
      if (options.rateLimitRule) {
        const rateLimitResult = checkRateLimit(request, options.rateLimitRule);
        
        if (!rateLimitResult.allowed) {
          // Add rate limit headers to security headers
          Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
            headers.set(key, value);
          });
          
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              resetTime: rateLimitResult.headers['X-RateLimit-Reset'],
            },
            { status: 429, headers }
          );
        }
        
        // Add rate limit headers to response headers
        Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
          headers.set(key, value);
        });
      }
      
      // Authentication check
      if (options.requireAuth !== false) {
        let sessionData: SessionData;
        
        try {
          sessionData = await getSessionData();
        } catch (error) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401, headers }
          );
        }
        
        // Authorization check
        if (options.requiredRoles && !hasRequiredRole(sessionData.role, options.requiredRoles)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403, headers }
          );
        }
        
        // Add rate limiting with user identifier for authenticated requests
        if (options.rateLimitRule) {
          const userRateLimitResult = checkRateLimit(
            request, 
            options.rateLimitRule, 
            sessionData.appUserId
          );
          
          if (!userRateLimitResult.allowed) {
            Object.entries(userRateLimitResult.headers).forEach(([key, value]) => {
              headers.set(key, value);
            });
            
            return NextResponse.json(
              { 
                error: 'Rate limit exceeded',
                resetTime: userRateLimitResult.headers['X-RateLimit-Reset'],
              },
              { status: 429, headers }
            );
          }
        }
        
        // Call the handler with session data
        const response = await handler(request, sessionData, ...args);
        
        // Add security headers to response
        Object.entries(SecurityHeaders).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
        
        return response;
      }
      
      // For non-authenticated routes, create dummy session data
      const dummySessionData = {} as SessionData;
      const response = await handler(request, dummySessionData, ...args);
      
      // Add security headers
      Object.entries(SecurityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;

    } catch (error) {
      logger.error('Auth middleware error', { error: error instanceof Error ? error.message : String(error) });

      const headers = new Headers(SecurityHeaders);
      
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 401, headers }
        );
      }
      
      if (error instanceof AuthorizationError) {
        return NextResponse.json(
          { error: error.message },
          { status: 403, headers }
        );
      }
      
      if (error instanceof RateLimitError) {
        headers.set('X-RateLimit-Reset', error.resetTime);
        return NextResponse.json(
          { error: error.message, resetTime: error.resetTime },
          { status: 429, headers }
        );
      }
      
      // Generic error
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers }
      );
    }
  };
}

// Resource ownership validation
export async function validateResourceAccess(
  resourceType: 'list' | 'task' | 'folder' | 'family_invite',
  resourceId: string,
  sessionData: SessionData,
  requireOwnership: boolean = false
): Promise<boolean> {
  try {
    switch (resourceType) {
      case 'list':
        const list = await prisma.list.findUnique({
          where: { id: resourceId },
          select: { 
            familyId: true, 
            visibility: true, 
            ownerId: true 
          },
        });
        
        if (!list || list.familyId !== sessionData.familyId) {
          return false;
        }
        
        if (requireOwnership && list.ownerId !== sessionData.appUserId) {
          return false;
        }
        
        // Check visibility permissions
        if (list.visibility === 'PRIVATE' && list.ownerId !== sessionData.appUserId) {
          return false;
        }
        
        if (list.visibility === 'ADULT' && !hasRequiredRole(sessionData.role, ['ADULT', 'ADMIN'])) {
          return false;
        }
        
        return true;
        
      case 'task':
        const task = await prisma.task.findUnique({
          where: { id: resourceId },
          include: {
            list: {
              select: {
                familyId: true,
                visibility: true,
                ownerId: true,
              },
            },
          },
        });
        
        if (!task || task.familyId !== sessionData.familyId) {
          return false;
        }
        
        if (requireOwnership && task.ownerId !== sessionData.appUserId) {
          return false;
        }
        
        // Inherit list visibility rules
        return validateResourceAccess('list', task.listId, sessionData, false);
        
      case 'folder':
        const folder = await prisma.folder.findUnique({
          where: { id: resourceId },
          select: { 
            familyId: true, 
            visibility: true, 
            ownerId: true 
          },
        });
        
        if (!folder || folder.familyId !== sessionData.familyId) {
          return false;
        }
        
        if (requireOwnership && folder.ownerId !== sessionData.appUserId) {
          return false;
        }
        
        // Check visibility permissions
        if (folder.visibility === 'PRIVATE' && folder.ownerId !== sessionData.appUserId) {
          return false;
        }
        
        if (folder.visibility === 'ADULT' && !hasRequiredRole(sessionData.role, ['ADULT', 'ADMIN'])) {
          return false;
        }
        
        return true;
        
      case 'family_invite':
        const invite = await prisma.familyInvite.findUnique({
          where: { id: resourceId },
          select: { familyId: true },
        });
        
        return invite?.familyId === sessionData.familyId;
        
      default:
        return false;
    }
  } catch (error) {
    logger.error('Resource access validation error', { error: error instanceof Error ? error.message : String(error) });
    return false;
  }
}

// Helper to validate family membership
export async function validateFamilyAccess(
  familyId: string,
  sessionData: SessionData
): Promise<boolean> {
  return sessionData.familyId === familyId;
}