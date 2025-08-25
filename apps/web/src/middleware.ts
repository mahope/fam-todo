/**
 * Next.js Middleware for authentication, CORS, and error handling
 */

import { NextResponse, NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/lists',
  '/tasks',
  '/family',
  '/settings',
  '/calendar',
  '/search',
  '/shopping'
];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/lists',
  '/api/tasks',
  '/api/family',
  '/api/folders',
  '/api/shopping',
  '/api/notifications',
  '/api/profile',
  '/api/settings',
  '/api/search',
  '/api/export'
];

// Public API routes (no auth required)
const publicApiRoutes = [
  '/api/auth',
  '/api/health',
  '/api/debug-status',
  '/api/diagnostics',
  '/api/socket'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    // Handle CORS for API routes
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.next();
      
      // Add CORS headers
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers });
      }

      // Skip auth check for public API routes
      if (publicApiRoutes.some(route => pathname.startsWith(route))) {
        return response;
      }

      // Check authentication for protected API routes
      if (protectedApiRoutes.some(route => pathname.startsWith(route))) {
        // Simplified auth check - will be re-implemented after deployment
        const authHeader = request.headers.get('authorization');
        const sessionCookie = request.cookies.get('next-auth.session-token') || 
                             request.cookies.get('__Secure-next-auth.session-token');

        if (!authHeader && !sessionCookie) {
          return NextResponse.json(
            { error: 'Authentication required', code: 'AUTH_REQUIRED' },
            { status: 401, headers: response.headers }
          );
        }
      }

      return response;
    }

    // Handle protected routes - simplified for deployment
    if (protectedRoutes.some(route => pathname.startsWith(route))) {
      const sessionCookie = request.cookies.get('next-auth.session-token') || 
                           request.cookies.get('__Secure-next-auth.session-token');

      if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Handle login page (redirect if already authenticated)
    if (pathname === '/login') {
      const sessionCookie = request.cookies.get('next-auth.session-token') || 
                           request.cookies.get('__Secure-next-auth.session-token');

      if (sessionCookie) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Handle root path redirect
    if (pathname === '/') {
      const sessionCookie = request.cookies.get('next-auth.session-token') || 
                           request.cookies.get('__Secure-next-auth.session-token');

      const redirectUrl = sessionCookie ? '/dashboard' : '/login';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return NextResponse.next();

  } catch (error) {
    console.error('Middleware error:', error);
    
    // Return error response for API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          error: 'Internal server error', 
          code: 'MIDDLEWARE_ERROR',
          ...(process.env.NODE_ENV !== 'production' && {
            details: error instanceof Error ? error.message : 'Unknown error'
          })
        },
        { status: 500 }
      );
    }

    // Redirect to error page for regular routes
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|sw.js|manifest.json).*)',
  ],
};