import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { JWT } from 'next-auth/jwt';
import type { Session, User } from 'next-auth';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env-validation';

// Extend NextAuth types to include our custom fields
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
    };
    appUserId?: string;
    familyId?: string;
    role?: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    appUserId?: string;
    familyId?: string;
    role?: Role;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        logger.debug('NextAuth authorize called', { email: credentials.email });

        // Simple auth check - find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { appUser: true },
        });

        logger.debug('User lookup result', { found: !!user, email: credentials.email });

        if (!user) {
          return null;
        }

        // Verify password against hash
        if (!user.password) {
          logger.warn('User account has no password set', { email: user.email });
          return null;
        }

        if (!credentials?.password) {
          logger.warn('No password provided for user', { email: user.email });
          return null;
        }
        
        const isValid = await verifyPassword(credentials.password, user.password);
        if (!isValid) {
          logger.warn('Invalid password attempt', { email: user.email });
          return null;
        }
        
        logger.info('Successful login', { email: user.email });
        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
        };
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      if (user) {
        logger.debug('JWT callback - user login', { userId: user.id });

        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { appUser: { include: { family: true } } },
          });

          if (dbUser?.appUser) {
            token.appUserId = dbUser.appUser.id;
            token.familyId = dbUser.appUser.familyId;
            token.role = dbUser.appUser.role;
            logger.debug('JWT callback - token enriched', {
              appUserId: token.appUserId,
              familyId: token.familyId,
              role: token.role
            });
          } else {
            logger.error('JWT callback - appUser not found', { userId: user.id, hasUser: !!dbUser });
          }
        } catch (error) {
          logger.error('JWT callback error', { error: error instanceof Error ? error.message : String(error) });
        }
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.appUserId = token.appUserId;
        session.familyId = token.familyId;
        session.role = token.role;

        // Fallback: If token doesn't have required fields, fetch from database
        if (!token.appUserId || !token.familyId) {
          logger.warn('Session callback - token missing required fields, fetching from database', {
            userId: session.user.id,
            hasAppUserId: !!token.appUserId,
            hasFamilyId: !!token.familyId
          });

          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: session.user.id },
              include: { appUser: true },
            });

            if (dbUser?.appUser) {
              session.appUserId = dbUser.appUser.id;
              session.familyId = dbUser.appUser.familyId;
              session.role = dbUser.appUser.role;

              logger.info('Session callback - successfully fetched missing data', {
                appUserId: session.appUserId,
                familyId: session.familyId,
                role: session.role
              });
            } else {
              logger.error('Session callback - appUser not found in database', { userId: session.user.id });
            }
          } catch (error) {
            logger.error('Session callback - database fetch failed', {
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }

        logger.debug('Session callback complete', {
          userId: session.user.id,
          hasAppUserId: !!session.appUserId,
          hasFamilyId: !!session.familyId
        });
      }
      return session;
    },
  },
};