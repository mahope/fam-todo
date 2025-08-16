// Authentication and session types
export interface SessionData {
  userId: string;
  appUserId: string;
  familyId: string;
  role: 'ADMIN' | 'ADULT' | 'CHILD';
  email: string;
  displayName: string;
}

// NextAuth.js user extension
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

// JWT token extension
export interface ExtendedJWT {
  sub: string;
  appUserId?: string;
  familyId?: string;
  role?: 'ADMIN' | 'ADULT' | 'CHILD';
}

// Session extension
export interface ExtendedSession {
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