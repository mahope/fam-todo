/**
 * Universal logger that works in both browser and server environments
 * Provides consistent logging interface across the entire application
 */

interface LogContext {
  [key: string]: any;
}

interface Logger {
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  debug: (message: string, context?: LogContext) => void;
  http: (message: string, context?: LogContext) => void;
}

class UniversalLogger implements Logger {
  private isServer = typeof window === 'undefined';
  private winston: any = null;

  constructor() {
    // Only initialize Winston during runtime on server, not during build
    if (this.isServer && typeof process !== 'undefined' && process.env.NODE_ENV !== undefined) {
      this.initializeWinston();
    }
  }

  private async initializeWinston() {
    try {
      // Dynamic import to avoid bundling Winston in client build
      const winston = await import('winston');
      this.winston = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            )
          })
        ]
      });
    } catch (error) {
      // Winston not available, will fallback to console
      console.warn('Winston not available, using console logging');
    }
  }

  private formatMessage(level: string, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    if (this.isServer && this.winston) {
      this.winston.info(message, context);
    } else {
      console.log(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.isServer && this.winston) {
      this.winston.warn(message, context);
    } else {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext): void {
    if (this.isServer && this.winston) {
      this.winston.error(message, context);
    } else {
      console.error(this.formatMessage('error', message, context));
    }
  }

  debug(message: string, context?: LogContext): void {
    // Only log debug in development
    if (process.env.NODE_ENV === 'development') {
      if (this.isServer && this.winston) {
        this.winston.debug(message, context);
      } else {
        console.log(this.formatMessage('debug', message, context));
      }
    }
  }

  http(message: string, context?: LogContext): void {
    if (this.isServer && this.winston) {
      this.winston.log('http', message, context);
    } else {
      console.log(this.formatMessage('http', message, context));
    }
  }
}

// Export singleton instance
export const logger = new UniversalLogger();

// Export traditional log functions for easier use
export const log = {
  error: (message: string, context?: LogContext) => logger.error(message, context),
  warn: (message: string, context?: LogContext) => logger.warn(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  http: (message: string, context?: LogContext) => logger.http(message, context),
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
};

// Helper functions for specific logging scenarios
export const logError = (error: Error, context?: string, meta?: LogContext) => {
  logger.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    stack: error.stack,
    name: error.name,
    context,
    ...meta,
  });
};

export const logRequest = (req: Request, res: any, duration?: number) => {
  const { method, url } = req;
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  logger.http('HTTP Request', {
    method,
    url,
    userAgent,
    ip,
    duration: duration ? `${duration}ms` : undefined,
    status: res?.status,
  });
};

export const logDbOperation = (operation: string, table: string, duration?: number, meta?: LogContext) => {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
    ...meta,
  });
};

export const logAuth = (event: string, userId?: string, meta?: LogContext) => {
  logger.info('Authentication Event', {
    event,
    userId,
    ...meta,
  });
};

export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high', meta?: LogContext) => {
  const logLevel = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
  logger[logLevel](`Security Event: ${event}`, {
    severity,
    event,
    ...meta,
  });
};

// Export types for external use
export type { Logger, LogContext };