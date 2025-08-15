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
}

class UniversalLogger implements Logger {
  private isServer = typeof window === 'undefined';
  private winston: any = null;

  constructor() {
    // Only load Winston on the server side
    if (this.isServer) {
      try {
        this.winston = require('winston');
      } catch (error) {
        // Winston not available, will fallback to console
      }
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
}

// Export singleton instance
export const logger = new UniversalLogger();

// Export types for external use
export type { Logger, LogContext };