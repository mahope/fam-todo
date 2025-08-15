import { NextRequest, NextResponse } from 'next/server';
import { httpMetrics, metrics } from './metrics';
import { logRequest, log } from './logger';
import { captureError } from './error-tracking';
// Use browser performance API or Node.js perf_hooks
const getPerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    return window.performance;
  } else if (typeof require !== 'undefined') {
    try {
      const { performance } = require('perf_hooks');
      return performance;
    } catch {
      return { now: () => Date.now() };
    }
  }
  return { now: () => Date.now() };
};

const performance = getPerformance();

// Request monitoring middleware
export function withMonitoring(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = performance.now();
    const method = request.method;
    const url = new URL(request.url);
    const route = getRoutePattern(url.pathname);
    
    // Start request timer
    const timerId = metrics.startTimer('http_request_duration', {
      method,
      route,
    });

    // Track active requests
    metrics.incrementCounter('http_requests_active', { method, route });

    let response: NextResponse;
    let error: Error | null = null;

    try {
      // Execute the handler
      response = await handler(request, ...args);
      
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      
      // Capture error for tracking
      captureError(error, {
        route,
        method,
        userAgent: request.headers.get('user-agent') || undefined,
        ip: request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || undefined,
      });

      // Return error response
      response = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    } finally {
      // Calculate request duration
      const duration = metrics.endTimer(timerId);
      const status = response?.status || 500;

      // Update metrics
      httpMetrics.requestDuration(method, route, status, duration);
      httpMetrics.requestCount(method, route, status);
      
      if (error) {
        httpMetrics.errorCount(method, route, error.name);
      }

      // Decrement active requests
      metrics.incrementCounter('http_requests_active', { method, route }, -1);

      // Log request
      logRequest(request, response, duration);

      // Log slow requests
      if (duration > 1000) { // More than 1 second
        log.warn('Slow request detected', {
          method,
          route,
          duration: `${duration}ms`,
          status,
          userAgent: request.headers.get('user-agent'),
        });
      }

      // Track request status metrics
      if (status >= 400) {
        metrics.incrementCounter('http_errors_total', {
          method,
          route,
          status: status.toString(),
        });
      }

      // Track 5xx errors separately
      if (status >= 500) {
        metrics.incrementCounter('http_server_errors_total', {
          method,
          route,
          status: status.toString(),
        });
      }
    }

    return response;
  };
}

// Database operation monitoring
export function withDbMonitoring<T>(
  operation: string,
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  return metrics.measureAsync(
    'db_query_duration',
    async () => {
      const startTime = performance.now();
      
      try {
        const result = await fn();
        
        const duration = performance.now() - startTime;
        
        // Track successful database operations
        metrics.incrementCounter('db_operations_total', {
          operation,
          table,
          status: 'success',
        });
        
        // Log slow queries
        if (duration > 500) { // More than 500ms
          log.warn('Slow database query detected', {
            operation,
            table,
            duration: `${duration}ms`,
          });
        }
        
        return result;
      } catch (error) {
        // Track failed database operations
        metrics.incrementCounter('db_operations_total', {
          operation,
          table,
          status: 'error',
        });
        
        metrics.incrementCounter('db_errors_total', {
          operation,
          table,
          error_type: error instanceof Error ? error.name : 'Unknown',
        });
        
        // Log database errors
        log.error('Database operation failed', {
          operation,
          table,
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw error;
      }
    },
    { operation, table }
  );
}

// Authentication monitoring
export function withAuthMonitoring<T>(
  event: string,
  fn: () => Promise<T>,
  userId?: string
): Promise<T> {
  return metrics.measureAsync(
    'auth_operation_duration',
    async () => {
      try {
        const result = await fn();
        
        // Track successful auth operations
        metrics.incrementCounter('auth_operations_total', {
          event,
          status: 'success',
        });
        
        log.info('Authentication event', {
          event,
          userId,
          status: 'success',
        });
        
        return result;
      } catch (error) {
        // Track failed auth operations
        metrics.incrementCounter('auth_operations_total', {
          event,
          status: 'error',
        });
        
        metrics.incrementCounter('auth_errors_total', {
          event,
          error_type: error instanceof Error ? error.name : 'Unknown',
        });
        
        log.warn('Authentication failure', {
          event,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw error;
      }
    },
    { event, user_id: userId }
  );
}

// Cache monitoring
export function withCacheMonitoring<T>(
  operation: 'get' | 'set' | 'delete',
  key: string,
  fn: () => Promise<T>,
  hit: boolean = false
): Promise<T> {
  return metrics.measureAsync(
    'cache_operation_duration',
    async () => {
      try {
        const result = await fn();
        
        // Track cache operations
        metrics.incrementCounter('cache_operations_total', {
          operation,
          status: 'success',
        });
        
        // Track cache hits/misses for get operations
        if (operation === 'get') {
          metrics.incrementCounter('cache_requests_total', {
            result: hit ? 'hit' : 'miss',
          });
        }
        
        return result;
      } catch (error) {
        metrics.incrementCounter('cache_operations_total', {
          operation,
          status: 'error',
        });
        
        log.warn('Cache operation failed', {
          operation,
          key,
          error: error instanceof Error ? error.message : String(error),
        });
        
        throw error;
      }
    },
    { operation, cache_key: key }
  );
}

// Business operation monitoring
export function withBusinessMetrics(
  operation: string,
  entityType: string,
  userId?: string
) {
  // Track business metrics
  metrics.incrementCounter('business_operations_total', {
    operation,
    entity_type: entityType,
  });
  
  // Track user activity
  if (userId) {
    metrics.incrementCounter('user_activity_total', {
      action: operation,
      entity_type: entityType,
    });
  }
  
  log.info('Business operation', {
    operation,
    entityType,
    userId,
  });
}

// Helper function to extract route pattern from pathname
function getRoutePattern(pathname: string): string {
  // Convert dynamic routes to patterns for better grouping
  return pathname
    .replace(/\/\d+/g, '/[id]')
    .replace(/\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '/[uuid]')
    .replace(/\?.*$/, '') // Remove query params
    || '/';
}

// Middleware factory for different monitoring types
export const createMonitoringMiddleware = (type: 'api' | 'auth' | 'db' | 'cache') => {
  switch (type) {
    case 'api':
      return withMonitoring;
    case 'auth':
      return withAuthMonitoring;
    case 'db':
      return withDbMonitoring;
    case 'cache':
      return withCacheMonitoring;
    default:
      return withMonitoring;
  }
};