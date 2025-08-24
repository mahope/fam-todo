#!/usr/bin/env node

/**
 * Environment validation script for production deployment
 * Checks all required environment variables and configurations
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const optionalEnvVars = [
  'VAPID_PUBLIC_KEY',
  'VAPID_PRIVATE_KEY',
  'NODE_ENV',
  'PORT'
];

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...');
  
  let hasErrors = false;
  const warnings = [];

  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${envVar}: ${envVar === 'DATABASE_URL' ? process.env[envVar].substring(0, 30) + '...' : '***'}`);
    }
  }

  // Check optional environment variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      warnings.push(`⚠️  Optional environment variable not set: ${envVar}`);
    } else {
      console.log(`✅ ${envVar}: ${envVar.includes('KEY') || envVar.includes('SECRET') ? '***' : process.env[envVar]}`);
    }
  }

  // Validate DATABASE_URL format
  if (process.env.DATABASE_URL) {
    if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
      console.error('❌ DATABASE_URL must be a PostgreSQL connection string');
      hasErrors = true;
    }
  }

  // Validate NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL);
      console.log('✅ NEXTAUTH_URL format is valid');
    } catch (error) {
      console.error('❌ NEXTAUTH_URL must be a valid URL');
      hasErrors = true;
    }
  }

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].replace('v', ''));
  if (majorVersion < 20) {
    console.error(`❌ Node.js version ${nodeVersion} is too old. Requires Node.js >= 20.9.0`);
    hasErrors = true;
  } else {
    console.log(`✅ Node.js version ${nodeVersion} is compatible`);
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('\nWarnings:');
    warnings.forEach(warning => console.log(warning));
  }

  // Final result
  if (hasErrors) {
    console.error('\n❌ Environment validation failed. Please fix the errors above.');
    process.exit(1);
  } else {
    console.log('\n✅ Environment validation passed!');
    process.exit(0);
  }
}

// Run validation
validateEnvironment();