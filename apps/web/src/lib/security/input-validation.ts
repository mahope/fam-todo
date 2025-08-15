// Input validation and sanitization utilities
import { z } from 'zod';

// Common validation schemas
export const ValidationSchemas = {
  // Email validation
  email: z.string()
    .email('Invalid email format')
    .max(254, 'Email too long') // RFC 5321 limit
    .toLowerCase()
    .trim(),
  
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  
  // Display name validation
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name too long')
    .regex(/^[a-zA-Z0-9\s\-_åæøÅÆØ]+$/, 'Display name contains invalid characters')
    .trim(),
  
  // Task/List title validation
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title too long')
    .trim(),
  
  // Description validation
  description: z.string()
    .max(2000, 'Description too long')
    .optional()
    .transform(val => val?.trim() || null),
  
  // Color validation (hex colors)
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
    .optional(),
  
  // UUID validation
  uuid: z.string()
    .uuid('Invalid ID format'),
  
  // Role validation
  role: z.enum(['ADMIN', 'ADULT', 'CHILD'], {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  
  // Visibility validation
  visibility: z.enum(['PRIVATE', 'FAMILY', 'ADULT'], {
    errorMap: () => ({ message: 'Invalid visibility setting' }),
  }),
  
  // Priority validation
  priority: z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => ({ message: 'Invalid priority' }),
  }).optional(),
  
  // Date validation
  date: z.coerce.date()
    .refine(date => date > new Date('1900-01-01'), 'Date too far in the past')
    .refine(date => date < new Date('2100-01-01'), 'Date too far in the future'),
  
  // Search query validation
  searchQuery: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query too long')
    .trim(),
  
  // Pagination validation
  pagination: z.object({
    page: z.coerce.number().int().min(1).max(1000).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
  
  // Sort validation
  sort: z.object({
    field: z.string().max(50),
    direction: z.enum(['asc', 'desc']).default('asc'),
  }).optional(),
} as const;

// Compound validation schemas for API endpoints
export const APISchemas = {
  // User registration
  registerUser: z.object({
    email: ValidationSchemas.email,
    password: ValidationSchemas.password,
    displayName: ValidationSchemas.displayName,
    familyName: z.string().min(1).max(100).trim().optional(),
  }),
  
  // User login
  loginUser: z.object({
    email: ValidationSchemas.email,
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().default(false),
  }),
  
  // Create task
  createTask: z.object({
    title: ValidationSchemas.title,
    description: ValidationSchemas.description,
    listId: ValidationSchemas.uuid,
    priority: ValidationSchemas.priority,
    deadline: ValidationSchemas.date.optional(),
    assigneeId: ValidationSchemas.uuid.optional(),
    tags: z.array(z.string().max(50).trim()).max(10).default([]),
  }),
  
  // Update task
  updateTask: z.object({
    title: ValidationSchemas.title.optional(),
    description: ValidationSchemas.description,
    priority: ValidationSchemas.priority,
    deadline: ValidationSchemas.date.optional().nullable(),
    assigneeId: ValidationSchemas.uuid.optional().nullable(),
    tags: z.array(z.string().max(50).trim()).max(10).optional(),
    completed: z.boolean().optional(),
  }),
  
  // Create list
  createList: z.object({
    name: ValidationSchemas.title,
    description: ValidationSchemas.description,
    visibility: ValidationSchemas.visibility,
    color: ValidationSchemas.color,
    folderId: ValidationSchemas.uuid.optional(),
    listType: z.enum(['TODO', 'SHOPPING']).default('TODO'),
  }),
  
  // Create folder
  createFolder: z.object({
    name: ValidationSchemas.title,
    visibility: ValidationSchemas.visibility,
    color: ValidationSchemas.color,
  }),
  
  // Family invite
  familyInvite: z.object({
    email: ValidationSchemas.email,
    role: ValidationSchemas.role.default('ADULT'),
    expiresInHours: z.number().int().min(1).max(168).default(72), // Max 1 week
  }),
  
  // Search request
  search: z.object({
    q: ValidationSchemas.searchQuery,
    type: z.enum(['all', 'tasks', 'lists', 'folders']).default('all'),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
  
  // Profile update
  updateProfile: z.object({
    displayName: ValidationSchemas.displayName.optional(),
    email: ValidationSchemas.email.optional(),
  }),
} as const;

// Input sanitization functions
export const sanitize = {
  // Remove HTML tags and dangerous characters
  html: (input: string): string => {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();
  },
  
  // Sanitize for SQL-like queries (though we use Prisma)
  sql: (input: string): string => {
    return input
      .replace(/[';\\]/g, '') // Remove potential SQL injection chars
      .trim();
  },
  
  // Sanitize filename
  filename: (input: string): string => {
    return input
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace non-alphanumeric with underscore
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .substring(0, 255) // Limit length
      .trim();
  },
  
  // Sanitize for logging (remove sensitive info)
  log: (input: any): any => {
    if (typeof input === 'string') {
      return input.replace(/password|token|secret|key/gi, '[REDACTED]');
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = Array.isArray(input) ? [] : {};
      for (const [key, value] of Object.entries(input)) {
        if (/password|token|secret|key/i.test(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = sanitize.log(value);
        }
      }
      return sanitized;
    }
    
    return input;
  },
};

// Validation error handler
export class ValidationError extends Error {
  public errors: z.ZodError['errors'];
  
  constructor(zodError: z.ZodError) {
    const message = zodError.errors.map(err => 
      `${err.path.join('.')}: ${err.message}`
    ).join(', ');
    
    super(`Validation failed: ${message}`);
    this.name = 'ValidationError';
    this.errors = zodError.errors;
  }
}

// Validation helper function
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error);
    }
    throw error;
  }
}

// Safe parsing with error handling
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: ValidationError;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: new ValidationError(error) };
    }
    return { success: false, error: error as ValidationError };
  }
}

// Content Security Policy helpers
export const CSP = {
  // Generate nonce for inline scripts
  generateNonce: (): string => {
    return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
  },
  
  // Basic CSP header value
  basic: `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https:;
    connect-src 'self' https://api.github.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
};

// Security headers
export const SecurityHeaders = {
  'Content-Security-Policy': CSP.basic,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;