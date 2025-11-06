// Database optimization utilities for improved performance
import { Prisma } from '@prisma/client';

// Common query optimizations
export const QueryOptimizations = {
  // Standard select fields for tasks to reduce data transfer
  taskSelect: {
    id: true,
    title: true,
    description: true,
    completed: true,
    priority: true,
    deadline: true,
    created_at: true,
    updated_at: true,
    tags: true,
    sortOrder: true,
    ownerId: true,
    assigneeId: true,
    listId: true,
  } as const,

  // Standard select fields for lists
  listSelect: {
    id: true,
    name: true,
    description: true,
    color: true,
    visibility: true,
    listType: true,
    created_at: true,
    updated_at: true,
    sortOrder: true,
    ownerId: true,
    folderId: true,
  } as const,

  // Standard select fields for folders
  folderSelect: {
    id: true,
    name: true,
    color: true,
    visibility: true,
    created_at: true,
    updated_at: true,
    sortOrder: true,
    ownerId: true,
  } as const,

  // Standard select for user references
  userSelect: {
    id: true,
    displayName: true,
  } as const,

  // Lightweight task select for lists
  taskSummarySelect: {
    id: true,
    title: true,
    completed: true,
    priority: true,
    deadline: true,
  } as const,
} as const;

// Optimized include patterns
export const OptimizedIncludes = {
  // Task with minimal relations
  taskWithBasicRelations: {
    owner: {
      select: QueryOptimizations.userSelect,
    },
    assignee: {
      select: QueryOptimizations.userSelect,
    },
    list: {
      select: {
        id: true,
        name: true,
        color: true,
        listType: true,
      },
    },
    _count: {
      select: {
        subtasks: true,
        comments: true,
      },
    },
  } as const,

  // List with task counts only
  listWithCounts: {
    owner: {
      select: QueryOptimizations.userSelect,
    },
    folder: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        tasks: {
          where: { completed: false },
        },
        allTasks: {
          where: {},
        },
      },
    },
  } as const,

  // List with recent tasks
  listWithRecentTasks: {
    owner: {
      select: QueryOptimizations.userSelect,
    },
    folder: {
      select: {
        id: true,
        name: true,
      },
    },
    tasks: {
      select: QueryOptimizations.taskSummarySelect,
      where: { completed: false },
      orderBy: { updated_at: 'desc' as const },
      take: 5,
    },
    _count: {
      select: {
        tasks: {
          where: { completed: false },
        },
      },
    },
  } as const,

  // Folder with list summaries
  folderWithListSummaries: {
    owner: {
      select: QueryOptimizations.userSelect,
    },
    lists: {
      select: {
        id: true,
        name: true,
        color: true,
        listType: true,
        visibility: true,
        _count: {
          select: {
            tasks: {
              where: { completed: false },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' as const },
    },
    _count: {
      select: {
        lists: true,
      },
    },
  } as const,
} as const;

// Pagination utilities
export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
  };
}

export function createPaginationQuery(options: PaginationOptions) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  return {
    skip,
    take: limit,
    page,
    limit,
  };
}

export function createPaginationResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const pages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}

// Database connection optimization
export const ConnectionOptimization = {
  // Connection pool settings for production
  connectionString: (baseUrl: string) => {
    const url = new URL(baseUrl);
    url.searchParams.set('connection_limit', '20');
    url.searchParams.set('pool_timeout', '10');
    url.searchParams.set('sslmode', 'require');
    return url.toString();
  },

  // Prisma client options for performance
  prismaOptions: {
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error'] as const
      : ['error'] as const,
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  } as const,
} as const;

// Query performance monitoring
export class QueryPerformanceMonitor {
  private queryTimes = new Map<string, number[]>();

  startQuery(queryName: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      
      if (!this.queryTimes.has(queryName)) {
        this.queryTimes.set(queryName, []);
      }
      
      const times = this.queryTimes.get(queryName)!;
      times.push(duration);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      // Log slow queries (server-side code)
      if (duration > 1000) {
        // eslint-disable-next-line no-console
        console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
      }
    };
  }

  getQueryStats(queryName: string) {
    const times = this.queryTimes.get(queryName) || [];
    
    if (times.length === 0) {
      return null;
    }
    
    const sorted = [...times].sort((a, b) => a - b);
    const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    return {
      count: times.length,
      avg: Math.round(avg),
      median,
      p95,
      min: sorted[0],
      max: sorted[sorted.length - 1],
    };
  }

  getAllStats() {
    const stats: Record<string, ReturnType<typeof this.getQueryStats>> = {};
    
    for (const queryName of this.queryTimes.keys()) {
      stats[queryName] = this.getQueryStats(queryName);
    }
    
    return stats;
  }
}

// Global query monitor instance
export const queryMonitor = new QueryPerformanceMonitor();

// Helper to wrap queries with performance monitoring
export function withQueryMonitoring<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const endTimer = queryMonitor.startQuery(queryName);
  
  return queryFn().finally(endTimer);
}

// Batch query utilities
export class BatchQueryHelper {
  private batchSize: number;
  
  constructor(batchSize: number = 1000) {
    this.batchSize = batchSize;
  }

  async processBatch<T, R>(
    items: T[],
    processFn: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += this.batchSize) {
      const batch = items.slice(i, i + this.batchSize);
      const batchResults = await processFn(batch);
      results.push(...batchResults);
    }
    
    return results;
  }
}

// Database index suggestions
export const IndexSuggestions = [
  // Tasks
  'CREATE INDEX IF NOT EXISTS idx_tasks_family_list ON tasks(familyId, listId);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_assignee_completed ON tasks(assigneeId, completed);',
  'CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;',
  'CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING gin(to_tsvector(\'english\', title || \' \' || coalesce(description, \'\')));',
  
  // Lists
  'CREATE INDEX IF NOT EXISTS idx_lists_family_folder ON lists(familyId, folderId);',
  'CREATE INDEX IF NOT EXISTS idx_lists_visibility_owner ON lists(visibility, ownerId);',
  
  // Folders
  'CREATE INDEX IF NOT EXISTS idx_folders_family_visibility ON folders(familyId, visibility);',
  
  // Activity logs
  'CREATE INDEX IF NOT EXISTS idx_activity_family_created ON activity_logs(familyId, created_at DESC);',
  'CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity_logs(appUserId, created_at DESC);',
  
  // Notifications
  'CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(appUserId, read, created_at DESC);',
  
  // Push subscriptions
  'CREATE INDEX IF NOT EXISTS idx_push_family_active ON push_subscriptions(familyId, isActive) WHERE isActive = true;',
] as const;

// Cache warming queries for application startup
export const WarmupQueries = {
  // Warm up connection pool
  async warmupConnection(prisma: any) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      // eslint-disable-next-line no-console
      console.log('Database connection warmed up');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Database warmup failed:', error);
    }
  },

  // Pre-load common data
  async preloadCommonData(prisma: any, familyId: string) {
    try {
      // Preload active lists and folders
      await Promise.all([
        prisma.list.findMany({
          where: { familyId },
          select: QueryOptimizations.listSelect,
          orderBy: { sortOrder: 'asc' },
        }),
        
        prisma.folder.findMany({
          where: { familyId },
          select: QueryOptimizations.folderSelect,
          orderBy: { sortOrder: 'asc' },
        }),
      ]);

      // eslint-disable-next-line no-console
      console.log('Common data preloaded for family:', familyId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Data preload failed:', error);
    }
  },
} as const;