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