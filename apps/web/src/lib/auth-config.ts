import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env-validation';

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
    async jwt({ token, user }: any) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { appUser: { include: { family: true } } },
        });

        if (dbUser?.appUser) {
          token.appUserId = dbUser.appUser.id;
          token.familyId = dbUser.appUser.familyId;
          token.role = dbUser.appUser.role;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub!;
        (session as any).appUserId = token.appUserId;
        (session as any).familyId = token.familyId;
        (session as any).role = token.role;
      }
      return session;
    },
  },
};