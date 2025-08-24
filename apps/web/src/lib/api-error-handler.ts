import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * Centralized API error handling utility
 * Provides consistent error logging and response formatting
 */

interface ApiErrorContext {
  operation: string;
  userId?: string;
  familyId?: string;
  resourceId?: string;
  [key: string]: any;
}

export function handleApiError(
  error: unknown, 
  context: ApiErrorContext,
  statusCode: number = 500
): NextResponse {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Log the error with context
  logger.error('API operation failed', {
    ...context,
    error: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });

  // Return appropriate error response
  return NextResponse.json(
    { 
      error: statusCode >= 500 
        ? 'Internal server error' 
        : errorMessage,
      code: statusCode
    },
    { status: statusCode }
  );
}

/**
 * Log successful API operations for monitoring
 */
export function logApiSuccess(
  operation: string,
  context: Omit<ApiErrorContext, 'operation'>
): void {
  logger.info('API operation successful', {
    operation,
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log API access attempts for security monitoring
 */
export function logApiAccess(
  method: string,
  path: string,
  userId?: string,
  familyId?: string
): void {
  logger.debug('API access', {
    method,
    path,
    userId,
    familyId,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Enhanced error handler for production deployments
 * Handles database connection issues, timeouts, and other deployment-specific errors
 */
export class ProductionApiErrorHandler {
  static handle(error: any, context: string = 'API'): NextResponse {
    // Log the error with full context
    logger.error(`${context} Error:`, {
      error: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
      context,
      timestamp: new Date().toISOString(),
    });

    // Database connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Database connection failed', code: 'DB_CONNECTION_ERROR' },
        { status: 503 }
      );
    }

    // Prisma-specific errors
    if (error.code?.startsWith('P')) {
      return this.handlePrismaError(error);
    }

    // Authentication errors
    if (error.name === 'JsonWebTokenError' || error.message?.includes('jwt')) {
      return NextResponse.json(
        { error: 'Invalid authentication token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }

    // Timeout errors
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout', code: 'TIMEOUT' },
        { status: 504 }
      );
    }

    // Memory/resource errors
    if (error.code === 'ENOMEM' || error.message?.includes('memory')) {
      return NextResponse.json(
        { error: 'Server resource error', code: 'RESOURCE_ERROR' },
        { status: 507 }
      );
    }

    // Default error response
    const isDevelopment = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      { 
        error: isDevelopment ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        ...(isDevelopment && { stack: error.stack })
      },
      { status: 500 }
    );
  }

  private static handlePrismaError(error: any): NextResponse {
    const errorMap: Record<string, { message: string; status: number; code: string }> = {
      'P1001': { message: 'Database server unreachable', status: 503, code: 'DB_UNREACHABLE' },
      'P1008': { message: 'Database operation timeout', status: 504, code: 'DB_TIMEOUT' },
      'P1010': { message: 'Database access denied', status: 503, code: 'DB_ACCESS_DENIED' },
      'P2002': { message: 'Record already exists', status: 409, code: 'DUPLICATE_RECORD' },
      'P2025': { message: 'Record not found', status: 404, code: 'RECORD_NOT_FOUND' },
      'P2003': { message: 'Foreign key constraint failed', status: 400, code: 'FOREIGN_KEY_ERROR' },
    };

    const mapped = errorMap[error.code];
    if (mapped) {
      return NextResponse.json(
        { 
          error: mapped.message, 
          code: mapped.code, 
          prismaCode: error.code 
        },
        { status: mapped.status }
      );
    }

    return NextResponse.json(
      { 
        error: 'Database operation failed', 
        code: 'DATABASE_ERROR',
        prismaCode: error.code
      },
      { status: 500 }
    );
  }
}