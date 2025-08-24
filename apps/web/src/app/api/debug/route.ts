import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test 1: Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    // Test 2: Check database connection
    let dbConnection = false;
    let dbError = null;
    try {
      await prisma.$connect();
      dbConnection = true;
      await prisma.$disconnect();
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 3: Check if tables exist
    let tablesExist = false;
    let tableError = null;
    try {
      await prisma.user.count();
      await prisma.family.count();
      await prisma.appUser.count();
      tablesExist = true;
    } catch (error) {
      tableError = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 4: Check user count
    let userCount = 0;
    try {
      if (tablesExist) {
        userCount = await prisma.user.count();
      }
    } catch (error) {
      // Ignore error, already handled above
    }

    return NextResponse.json({
      status: 'debug',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        variables: envCheck,
      },
      database: {
        connection: dbConnection,
        connectionError: dbError,
        tablesExist,
        tableError,
        userCount,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}