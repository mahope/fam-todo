/**
 * Simple NextAuth.js middleware for authentication
 */

export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/lists/:path*',
    '/tasks/:path*',
    '/family/:path*',
    '/settings/:path*',
    '/calendar/:path*',
    '/search/:path*',
    '/shopping/:path*',
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