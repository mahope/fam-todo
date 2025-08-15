import winston from 'winston';
import path from 'path';

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
  },
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format for structured logging
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
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
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport for development
if (process.env.NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    })
  );
} else {
  // Production console with JSON format
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: process.env.LOG_LEVEL || 'info',
    })
  );
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    })
  );

  // HTTP access log
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'access.log'),
      level: 'http',
      format: logFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
export const logger = winston.createLogger({
  levels: customLevels.levels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Export log functions for easier use
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.log('http', message, meta),
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
  logger.log(logLevel, `Security Event: ${event}`, {
    severity,
    event,
    ...meta,
  });
};