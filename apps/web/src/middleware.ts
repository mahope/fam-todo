/**
 * NextAuth middleware with Next.js 15 compatibility
 * Uses withAuth for proper JWT token verification
 */

import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from 'next/server'

export default withAuth(
  function middleware(request: NextRequest) {
    // Allow all authenticated requests to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Skip auth for public routes
        if (req.nextUrl.pathname.startsWith('/api/health') ||
            req.nextUrl.pathname.startsWith('/api/debug') ||
            req.nextUrl.pathname.startsWith('/api/auth/') ||
            req.nextUrl.pathname === '/api/route'
        ) {
          return true
        }

        // Require token for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Protected pages
    '/dashboard/:path*',
    '/lists/:path*', 
    '/tasks/:path*',
    '/family/:path*',
    '/settings/:path*',
    '/calendar/:path*',
    '/search/:path*',
    '/shopping/:path*',
    // Protected API routes
    '/api/lists/:path*',
    '/api/tasks/:path*',
    '/api/family/:path*',
    '/api/folders/:path*',
    '/api/shopping/:path*',
    '/api/notifications/:path*',
    '/api/profile/:path*',
    '/api/settings/:path*',
    '/api/search/:path*',
    '/api/export/:path*'
  ]
};