/**
 * Environment variable validation and type safety
 * Ensures all required environment variables are present at startup
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(1, 'NEXTAUTH_SECRET is required'),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().optional().default('8080'),
  
  // Optional - Push notifications
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
});

// Validate environment variables
function validateEnv() {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Additional validation
    if (!parsed.DATABASE_URL.startsWith('postgresql://') && !parsed.DATABASE_URL.startsWith('postgres://')) {
      throw new Error('DATABASE_URL must be a PostgreSQL connection string');
    }
    
    // Validate NEXTAUTH_SECRET length for security
    if (parsed.NEXTAUTH_SECRET.length < 32) {
      console.warn('⚠️  NEXTAUTH_SECRET should be at least 32 characters long for security');
    }
    
    return parsed;
  } catch (error) {
    console.error('❌ Environment variable validation failed:');
    if (error instanceof z.ZodError) {
      error.errors.forEach(err => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error(`  - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.error('\nPlease set the required environment variables and restart the server.');
    process.exit(1);
  }
}

// Export validated environment variables
export const env = validateEnv();

// Export validation function for runtime checks
export { validateEnv };

// Type-safe environment access
export type Env = z.infer<typeof envSchema>;