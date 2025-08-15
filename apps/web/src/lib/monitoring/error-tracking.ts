import { log, logError } from './logger';
import { metrics } from './metrics';

// Error types
export interface ErrorContext {
  userId?: string;
  familyId?: string;
  route?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: string;
  extra?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  name: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  firstSeen: string;
  lastSeen: string;
  fingerprint: string;
}

// Error tracking class
class ErrorTracker {
  private errorStore: Map<string, ErrorReport> = new Map();
  private maxErrors = 1000; // Keep last 1000 unique errors
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // Clean up old errors every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  // Capture and track errors
  captureError(error: Error, context: ErrorContext = {}): string {
    const fingerprint = this.generateFingerprint(error, context);
    const errorId = this.generateErrorId();
    const now = new Date().toISOString();
    
    // Update metrics
    metrics.incrementCounter('errors_total', {
      name: error.name,
      route: context.route || 'unknown',
    });

    const existingError = this.errorStore.get(fingerprint);
    
    if (existingError) {
      // Update existing error
      existingError.count++;
      existingError.lastSeen = now;
      existingError.context = { ...existingError.context, ...context };
      
      // Log recurring error
      if (existingError.count % 10 === 0) { // Log every 10th occurrence
        log.warn(`Recurring error (${existingError.count} times)`, {
          errorId: existingError.id,
          fingerprint,
          message: error.message,
          context,
        });
      }
    } else {
      // Create new error report
      const severity = this.determineSeverity(error, context);
      const errorReport: ErrorReport = {
        id: errorId,
        message: error.message,
        stack: error.stack,
        name: error.name,
        context: { ...context, timestamp: now },
        severity,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        fingerprint,
      };
      
      this.errorStore.set(fingerprint, errorReport);
      
      // Log new error
      const logLevel = severity === 'critical' ? 'error' : severity === 'high' ? 'error' : 'warn';
      logError(error, `New error captured [${severity}]`, {
        errorId,
        fingerprint,
        context,
      });
      
      // Alert on critical errors
      if (severity === 'critical') {
        this.handleCriticalError(errorReport);
      }
    }
    
    return fingerprint;
  }

  // Capture unhandled errors
  setupGlobalErrorHandling() {
    // Node.js unhandled exceptions
    process.on('uncaughtException', (error) => {
      this.captureError(error, {
        route: 'uncaught_exception',
        extra: { type: 'uncaughtException' },
      });
      
      log.error('Uncaught Exception - Application will exit', {
        error: error.message,
        stack: error.stack,
      });
      
      // Give time for logging before exit
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });
    
    // Node.js unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      const error = reason instanceof Error ? reason : new Error(String(reason));
      this.captureError(error, {
        route: 'unhandled_rejection',
        extra: { type: 'unhandledRejection', promise: String(promise) },
      });
      
      log.error('Unhandled Promise Rejection', {
        reason: String(reason),
        promise: String(promise),
      });
    });
    
    // Browser error handling
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        const error = event.error || new Error(event.message);
        this.captureError(error, {
          route: 'browser_error',
          extra: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });
      
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        this.captureError(error, {
          route: 'browser_unhandled_rejection',
          extra: { reason: String(event.reason) },
        });
      });
    }
  }

  // Get error reports
  getErrorReports(options: {
    severity?: string;
    limit?: number;
    since?: string;
  } = {}): ErrorReport[] {
    let reports = Array.from(this.errorStore.values());
    
    // Filter by severity
    if (options.severity) {
      reports = reports.filter(r => r.severity === options.severity);
    }
    
    // Filter by time
    if (options.since) {
      const sinceDate = new Date(options.since);
      reports = reports.filter(r => new Date(r.lastSeen) >= sinceDate);
    }
    
    // Sort by last seen (most recent first)
    reports.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
    
    // Limit results
    if (options.limit) {
      reports = reports.slice(0, options.limit);
    }
    
    return reports;
  }

  // Get error statistics
  getErrorStats(): {
    total: number;
    byName: Record<string, number>;
    bySeverity: Record<string, number>;
    byRoute: Record<string, number>;
    recentErrors: number;
  } {
    const reports = Array.from(this.errorStore.values());
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const stats = {
      total: reports.reduce((sum, r) => sum + r.count, 0),
      byName: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byRoute: {} as Record<string, number>,
      recentErrors: 0,
    };
    
    reports.forEach(report => {
      // By name
      stats.byName[report.name] = (stats.byName[report.name] || 0) + report.count;
      
      // By severity
      stats.bySeverity[report.severity] = (stats.bySeverity[report.severity] || 0) + report.count;
      
      // By route
      const route = report.context.route || 'unknown';
      stats.byRoute[route] = (stats.byRoute[route] || 0) + report.count;
      
      // Recent errors
      if (new Date(report.lastSeen) >= oneHourAgo) {
        stats.recentErrors += report.count;
      }
    });
    
    return stats;
  }

  // Clear specific error
  clearError(fingerprint: string): boolean {
    return this.errorStore.delete(fingerprint);
  }

  // Clear all errors
  clearAllErrors(): void {
    this.errorStore.clear();
  }

  private generateFingerprint(error: Error, context: ErrorContext): string {
    // Create unique fingerprint for grouping similar errors
    const parts = [
      error.name,
      error.message,
      context.route || '',
      this.getStackFingerprint(error.stack || ''),
    ];
    
    return Buffer.from(parts.join('|')).toString('base64').slice(0, 16);
  }

  private getStackFingerprint(stack: string): string {
    // Extract relevant parts of stack trace for fingerprinting
    const lines = stack.split('\n').slice(0, 3); // Top 3 lines
    return lines
      .map(line => line.trim())
      .filter(line => line.includes('at '))
      .map(line => {
        // Remove file paths and line numbers for consistent fingerprinting
        return line.replace(/\(.*?\)/g, '()').replace(/at\s+/, '');
      })
      .join('|');
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(error: Error, context: ErrorContext): 'low' | 'medium' | 'high' | 'critical' {
    // Critical errors
    if (error.name === 'SyntaxError' || 
        error.name === 'ReferenceError' ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('Database connection failed')) {
      return 'critical';
    }
    
    // High severity errors
    if (error.name === 'TypeError' ||
        error.name === 'RangeError' ||
        context.route?.includes('/api/auth') ||
        error.message.includes('Permission denied')) {
      return 'high';
    }
    
    // Medium severity errors
    if (error.name === 'ValidationError' ||
        error.name === 'NotFoundError' ||
        context.route?.includes('/api/')) {
      return 'medium';
    }
    
    // Default to low severity
    return 'low';
  }

  private handleCriticalError(errorReport: ErrorReport) {
    // Log critical error with maximum detail
    log.error('CRITICAL ERROR DETECTED', {
      errorId: errorReport.id,
      message: errorReport.message,
      stack: errorReport.stack,
      context: errorReport.context,
      fingerprint: errorReport.fingerprint,
    });
    
    // Update critical error metrics
    metrics.incrementCounter('critical_errors_total', {
      name: errorReport.name,
      route: errorReport.context.route || 'unknown',
    });
    
    // In production, this could send alerts to external services
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send alert to external monitoring service
      // e.g., PagerDuty, Slack, email notification
    }
  }

  private cleanup() {
    const errorArray = Array.from(this.errorStore.entries());
    
    if (errorArray.length <= this.maxErrors) {
      return;
    }
    
    // Sort by last seen and keep only the most recent errors
    errorArray.sort(([, a], [, b]) => 
      new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );
    
    // Clear old errors
    const toKeep = errorArray.slice(0, this.maxErrors);
    this.errorStore.clear();
    toKeep.forEach(([fingerprint, error]) => {
      this.errorStore.set(fingerprint, error);
    });
    
    log.info('Error store cleanup completed', {
      kept: toKeep.length,
      removed: errorArray.length - toKeep.length,
    });
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export const captureError = (error: Error, context?: ErrorContext) => 
  errorTracker.captureError(error, context);

export const setupErrorTracking = () => 
  errorTracker.setupGlobalErrorHandling();

export const getErrorReports = (options?: Parameters<typeof errorTracker.getErrorReports>[0]) => 
  errorTracker.getErrorReports(options);

export const getErrorStats = () => 
  errorTracker.getErrorStats();