import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '@/lib/logger';

const execAsync = promisify(exec);

export async function POST() {
  try {
    logger.info('Starting manual database migration...');

    // Run prisma migrate deploy
    const { stdout, stderr } = await execAsync('cd apps/web && npx prisma migrate deploy', {
      cwd: '/app',
      timeout: 60000, // 60 second timeout
    });

    logger.info('Migration stdout', { stdout });
    if (stderr) {
      logger.warn('Migration stderr', { stderr });
    }

    // Run prisma generate to ensure client is up to date
    const { stdout: generateStdout, stderr: generateStderr } = await execAsync('cd apps/web && npx prisma generate', {
      cwd: '/app',
      timeout: 30000,
    });

    logger.info('Generate stdout', { stdout: generateStdout });
    if (generateStderr) {
      logger.warn('Generate stderr', { stderr: generateStderr });
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
    logger.error('Migration failed', { error: error instanceof Error ? error.message : String(error) });

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