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
        if (!credentials?.email) {
          return null;
        }

        console.log('NextAuth authorize called with:', credentials.email);

        // Simple auth check - find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { appUser: true },
        });

        console.log('Found user:', user ? 'Yes' : 'No');

        if (!user) {
          return null;
        }

        // For now, we'll accept any non-empty password since we don't store passwords yet
        // This is temporary until we implement proper password storage
        if (!credentials?.password || credentials.password.length < 1) {
          console.log('No password provided');
          return null;
        }
        
        console.log('Login successful for:', user.email);
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