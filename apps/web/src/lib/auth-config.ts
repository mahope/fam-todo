import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Simple auth check - find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { appUser: true },
        });

        if (!user) {
          return null;
        }

        // For now, we'll accept any password (should be hashed comparison in production)
        // You can implement proper password hashing later
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
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
    async session({ session, token }) {
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