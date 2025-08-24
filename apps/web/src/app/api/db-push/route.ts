import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('Starting database schema push...');
    
    // Run prisma db push to create tables from schema
    const { stdout, stderr } = await execAsync('cd apps/web && npx prisma db push --force-reset', {
      cwd: '/app',
      timeout: 120000, // 2 minute timeout
    });
    
    console.log('DB Push stdout:', stdout);
    if (stderr) {
      console.log('DB Push stderr:', stderr);
    }
    
    // Run prisma generate to ensure client is up to date
    const { stdout: generateStdout, stderr: generateStderr } = await execAsync('cd apps/web && npx prisma generate', {
      cwd: '/app',
      timeout: 30000,
    });
    
    console.log('Generate stdout:', generateStdout);
    if (generateStderr) {
      console.log('Generate stderr:', generateStderr);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database schema pushed successfully',
      dbPush: {
        stdout,
        stderr,
      },
      generate: {
        stdout: generateStdout,
        stderr: generateStderr,
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('DB Push failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'DB Push failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to push database schema',
    instructions: 'Send a POST request to this endpoint to create database tables from Prisma schema',
    warning: 'This will reset the database and recreate all tables',
  });
}