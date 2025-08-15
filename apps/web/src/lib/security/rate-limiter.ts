// Rate limiting utility for API endpoints
interface RateLimitRule {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: Request) => string; // Custom key generation
}

interface RateLimitState {
  count: number;
  resetTime: number;
}

class MemoryRateLimiter {
  private store = new Map<string, RateLimitState>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, state] of this.store.entries()) {
        if (now > state.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  checkLimit(key: string, rule: RateLimitRule): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now();
    const resetTime = now + rule.windowMs;
    
    let state = this.store.get(key);
    
    if (!state || now > state.resetTime) {
      // First request or window expired
      state = { count: 1, resetTime };
      this.store.set(key, state);
      return { allowed: true, resetTime, remaining: rule.maxRequests - 1 };
    }
    
    if (state.count >= rule.maxRequests) {
      // Rate limit exceeded
      return { allowed: false, resetTime: state.resetTime, remaining: 0 };
    }
    
    // Increment counter
    state.count++;
    return { allowed: true, resetTime: state.resetTime, remaining: rule.maxRequests - state.count };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new MemoryRateLimiter();

// Default rate limit rules
export const RateLimitRules = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  
  // General API endpoints
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many requests. Please slow down.',
  },
  
  // File upload endpoints
  upload: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 5, // 5 uploads per minute
    message: 'Too many file uploads. Please wait before uploading again.',
  },
  
  // Search endpoints
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 searches per minute
    message: 'Too many search requests. Please slow down.',
  },
  
  // Admin operations
  admin: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 admin operations per 5 minutes
    message: 'Too many admin operations. Please wait before trying again.',
  },
} as const;

// Extract client IP from request
function getClientIP(request: Request): string {
  // Check various headers for real IP
  const headers = ['x-forwarded-for', 'x-real-ip', 'cf-connecting-ip'];
  
  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // Take first IP if comma-separated
      return value.split(',')[0].trim();
    }
  }
  
  // Fallback to a default identifier
  return 'unknown';
}

// Generate rate limit key
function generateRateLimitKey(request: Request, prefix: string, userIdentifier?: string): string {
  const clientIP = getClientIP(request);
  const baseKey = userIdentifier || clientIP;
  return `ratelimit:${prefix}:${baseKey}`;
}

// Rate limiting middleware
export function createRateLimit(rule: RateLimitRule, prefix: string) {
  return function rateLimit(request: Request, userIdentifier?: string): {
    allowed: boolean;
    headers: Record<string, string>;
    error?: { message: string; status: number };
  } {
    const key = generateRateLimitKey(request, prefix, userIdentifier);
    const result = rateLimiter.checkLimit(key, rule);
    
    const headers = {
      'X-RateLimit-Limit': rule.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString(),
    };
    
    if (!result.allowed) {
      return {
        allowed: false,
        headers,
        error: {
          message: rule.message || 'Rate limit exceeded',
          status: 429,
        },
      };
    }
    
    return { allowed: true, headers };
  };
}

// Pre-configured rate limiters
export const rateLimiters = {
  auth: createRateLimit(RateLimitRules.auth, 'auth'),
  api: createRateLimit(RateLimitRules.api, 'api'),
  upload: createRateLimit(RateLimitRules.upload, 'upload'),
  search: createRateLimit(RateLimitRules.search, 'search'),
  admin: createRateLimit(RateLimitRules.admin, 'admin'),
};

// Rate limit check for API routes
export function checkRateLimit(
  request: Request,
  ruleName: keyof typeof rateLimiters,
  userIdentifier?: string
): {
  allowed: boolean;
  headers: Record<string, string>;
  response?: Response;
} {
  const rateLimiter = rateLimiters[ruleName];
  const result = rateLimiter(request, userIdentifier);
  
  if (!result.allowed) {
    return {
      allowed: false,
      headers: result.headers,
      response: new Response(
        JSON.stringify({
          error: result.error!.message,
          resetTime: result.headers['X-RateLimit-Reset'],
        }),
        {
          status: result.error!.status,
          headers: {
            'Content-Type': 'application/json',
            ...result.headers,
          },
        }
      ),
    };
  }
  
  return { allowed: true, headers: result.headers };
}

// Cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => rateLimiter.destroy());
  process.on('SIGINT', () => rateLimiter.destroy());
}