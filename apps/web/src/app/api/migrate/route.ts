import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    console.log('Starting manual database migration...');
    
    // Run prisma migrate deploy
    const { stdout, stderr } = await execAsync('cd apps/web && npx prisma migrate deploy', {
      cwd: '/app',
      timeout: 60000, // 60 second timeout
    });
    
    console.log('Migration stdout:', stdout);
    if (stderr) {
      console.log('Migration stderr:', stderr);
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
      message: 'Database migration completed successfully',
      migration: {
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
    console.error('Migration failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to run migrations',
    instructions: 'Send a POST request to this endpoint to run database migrations manually',
  });
}