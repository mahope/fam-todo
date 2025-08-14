import { betterAuth } from "better-auth";
import { SignJWT } from "jose";
import { Pool } from "pg";

// Database connection for BetterAuth
const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: 5432,
  database: process.env.POSTGRES_DB || "postgres",
  user: "postgres",
  password: process.env.POSTGRES_PASSWORD,
});

// Database helper for direct queries
async function queryDatabase(sql: string, params: any[] = []) {
  try {
    const result = await pool.query(sql, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

export const auth = betterAuth({
  database: pool,
  logger: {
    verboseLogging: true,
    level: "debug",
  },
  session: {
    expiresIn: 60 * 60 * 24 * 365, // 1 year for "remember me"
    updateAge: 60 * 60 * 24, // Update session if older than 1 day
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    customPayload: async (user: any) => {
      // Fetch user's family and role from app_users table
      const appUsers = await queryDatabase(
        `SELECT id, family_id, role FROM app_users WHERE auth_user_id = $1`,
        [user.id]
      );

      if (!appUsers || appUsers.length === 0) {
        // If no app_user exists yet, return minimal payload
        return {};
      }

      const appUser = appUsers[0];

      return {
        app_user_id: appUser.id,
        family_id: appUser.family_id,
        role_name: appUser.role,
        aud: "postgrest",
        iss: "famtodo",
      };
    },
  },
  callbacks: {
    session: {
      create: async ({ session, user }: { session: any; user: any }) => {
        // Create JWT token with custom claims for PostgREST
        const appUsers = await queryDatabase(
          `SELECT id, family_id, role FROM app_users WHERE auth_user_id = $1`,
          [user.id]
        );

        if (appUsers && appUsers.length > 0) {
          const appUser = appUsers[0];
          const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

          const token = await new SignJWT({
            role: "authenticated", // Required by PostgREST
            app_user_id: appUser.id,
            family_id: appUser.family_id,
            role_name: appUser.role,
            email: user.email,
            aud: "postgrest",
            iss: "famtodo",
            sub: user.id,
          })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1y")
            .sign(secret);

          // Attach the JWT to the session
          (session as any).postgrestToken = token;
        }

        return session;
      },
    },
    user: {
      create: async ({ user }: { user: any }) => {
        // After BetterAuth creates the auth user, create an app_user
        const familyName = user.email.split("@")[0] + "'s Family";
        
        // Create family
        const families = await queryDatabase(
          `INSERT INTO families (name) VALUES ($1) RETURNING id`,
          [familyName]
        );
        
        if (families && families.length > 0) {
          const familyId = families[0].id;
          
          // Create app_user
          await queryDatabase(
            `INSERT INTO app_users (auth_user_id, family_id, role, email, display_name) 
             VALUES ($1, $2, 'admin', $3, $4)`,
            [user.id, familyId, user.email, user.name || user.email]
          );
        }

        return user;
      },
    },
  },
});