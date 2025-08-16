// NextAuth type extensions

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
    role?: 'ADMIN' | 'ADULT' | 'CHILD';
  }

  interface User {
    id: string;
    email: string;
    name?: string;
    image?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub: string;
    appUserId?: string;
    familyId?: string;
    role?: 'ADMIN' | 'ADULT' | 'CHILD';
  }
}