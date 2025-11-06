import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '@/lib/logger';

const execAsync = promisify(exec);

export async function POST() {
  try {
    logger.info('Starting database schema push...');

    // Run prisma db push to create tables from schema
    const { stdout, stderr } = await execAsync('cd apps/web && npx prisma db push --force-reset', {
      cwd: '/app',
      timeout: 120000, // 2 minute timeout
    });

    logger.info('DB Push stdout', { stdout });
    if (stderr) {
      logger.warn('DB Push stderr', { stderr });
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
    logger.error('DB Push failed', { error: error instanceof Error ? error.message : String(error) });

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