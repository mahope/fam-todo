// Re-export NextAuth functions for compatibility with existing components
export { signIn, signOut, useSession, getSession } from 'next-auth/react';

// Note: signUp is handled through our custom registration endpoint
// Components should redirect to /register instead of using signUp