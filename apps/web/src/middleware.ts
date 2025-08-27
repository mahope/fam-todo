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
    '/api/lists',
    '/api/lists/:path*',
    '/api/tasks',
    '/api/tasks/:path*',
    '/api/family',
    '/api/family/:path*',
    '/api/folders',
    '/api/folders/:path*',
    '/api/shopping',
    '/api/shopping/:path*',
    '/api/notifications',
    '/api/notifications/:path*',
    '/api/profile',
    '/api/profile/:path*',
    '/api/settings',
    '/api/settings/:path*',
    '/api/search',
    '/api/search/:path*',
    '/api/export',
    '/api/export/:path*'
  ]
};