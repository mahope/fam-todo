// Universal logger that works in both browser and server environments

// Browser console colors
const colors = {
  error: '#ef4444',
  warn: '#f59e0b', 
  info: '#10b981',
  http: '#8b5cf6',
  debug: '#6b7280',
};

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

class UniversalLogger {
  private isServer = typeof window === 'undefined';
  private winstonLogger: any = null;

  constructor() {
    if (this.isServer) {
      this.initializeServerLogger();
    }
  }

  private async initializeServerLogger() {
    try {
      const winston = require('winston');
      const path = require('path');

      const customLevels = {
        levels,
        colors: {
          error: 'red',
          warn: 'yellow',
          info: 'green',
          http: 'magenta',
          debug: 'white',
        },
      };

      winston.addColors(customLevels.colors);

      // Custom format for structured logging
      const logFormat = winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
          });
        })
      );

      // Console format for development
      const consoleFormat = winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }: any) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      );

      const transports: any[] = [];

      // Console transport
      if (process.env.NODE_ENV === 'development') {
        transports.push(
          new winston.transports.Console({
            format: consoleFormat,
            level: 'debug',
          })
        );
      } else {
        transports.push(
          new winston.transports.Console({
            format: logFormat,
            level: process.env.LOG_LEVEL || 'info',
          })
        );
      }

      // File transports for production
      if (process.env.NODE_ENV === 'production') {
        // Ensure logs directory exists
        const fs = require('fs');
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true });
        }

        // Error log file
        transports.push(
          new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            format: logFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          })
        );

        // Combined log file
        transports.push(
          new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            format: logFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 10,
          })
        );

        // HTTP access log
        transports.push(
          new winston.transports.File({
            filename: path.join(logsDir, 'access.log'),
            level: 'http',
            format: logFormat,
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
          })
        );
      }

      this.winstonLogger = winston.createLogger({
        levels: customLevels.levels,
        format: logFormat,
        transports,
        exitOnError: false,
      });
    } catch (error) {
      console.warn('Failed to initialize Winston logger, using console fallback');
    }
  }

  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
  }

  private logToBrowser(level: string, message: string, meta?: any) {
    const color = colors[level as keyof typeof colors] || '#6b7280';
    const formattedMessage = this.formatMessage(level, message, meta);
    
    if (console[level as keyof Console]) {
      (console[level as keyof Console] as any)(
        `%c${formattedMessage}`,
        `color: ${color}; font-weight: bold;`
      );
    } else {
      console.log(
        `%c${formattedMessage}`,
        `color: ${color}; font-weight: bold;`
      );
    }
  }

  error(message: string, meta?: any): void {
    if (this.isServer && this.winstonLogger) {
      this.winstonLogger.error(message, meta);
    } else {
      this.logToBrowser('error', message, meta);
    }
  }

  warn(message: string, meta?: any): void {
    if (this.isServer && this.winstonLogger) {
      this.winstonLogger.warn(message, meta);
    } else {
      this.logToBrowser('warn', message, meta);
    }
  }

  info(message: string, meta?: any): void {
    if (this.isServer && this.winstonLogger) {
      this.winstonLogger.info(message, meta);
    } else {
      this.logToBrowser('info', message, meta);
    }
  }

  http(message: string, meta?: any): void {
    if (this.isServer && this.winstonLogger) {
      this.winstonLogger.log('http', message, meta);
    } else {
      this.logToBrowser('http', message, meta);
    }
  }

  debug(message: string, meta?: any): void {
    if (this.isServer && this.winstonLogger) {
      this.winstonLogger.debug(message, meta);
    } else if (process.env.NODE_ENV === 'development') {
      this.logToBrowser('debug', message, meta);
    }
  }
}

// Create logger instance
export const logger = new UniversalLogger();

// Export log functions for easier use
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
};

// Request logging middleware function
export const logRequest = (req: Request, res: any, duration?: number) => {
  const { method, url } = req;
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  log.http('HTTP Request', {
    method,
    url,
    userAgent,
    ip,
    duration: duration ? `${duration}ms` : undefined,
    status: res?.status,
  });
};

// Error logging helper
export const logError = (error: Error, context?: string, meta?: any) => {
  log.error(`${context ? `[${context}] ` : ''}${error.message}`, {
    stack: error.stack,
    name: error.name,
    context,
    ...meta,
  });
};

// Database operation logging
export const logDbOperation = (operation: string, table: string, duration?: number, meta?: any) => {
  log.debug('Database Operation', {
    operation,
    table,
    duration: duration ? `${duration}ms` : undefined,
    ...meta,
  });
};

// Authentication logging
export const logAuth = (event: string, userId?: string, meta?: any) => {
  log.info('Authentication Event', {
    event,
    userId,
    ...meta,
  });
};

// Security event logging
export const logSecurity = (event: string, severity: 'low' | 'medium' | 'high', meta?: any) => {
  const logLevel = severity === 'high' ? 'error' : severity === 'medium' ? 'warn' : 'info';
  logger[logLevel](`Security Event: ${event}`, {
    severity,
    event,
    ...meta,
  });
};