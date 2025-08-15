import { QueryClient } from '@tanstack/react-query';

// Enhanced query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep in cache for 10 minutes when unused
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (but not too aggressively)
      refetchOnWindowFocus: false,
      // Don't refetch on mount if data is fresh
      refetchOnMount: 'stale',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

// Cache keys factory for consistency
export const cacheKeys = {
  // Lists
  lists: ['lists'] as const,
  list: (id: string) => ['lists', id] as const,
  listTasks: (id: string) => ['lists', id, 'tasks'] as const,
  
  // Tasks
  tasks: ['tasks'] as const,
  task: (id: string) => ['tasks', id] as const,
  tasksByList: (listId: string) => ['tasks', 'by-list', listId] as const,
  tasksByStatus: (status: string) => ['tasks', 'by-status', status] as const,
  tasksCalendar: ['tasks', 'calendar'] as const,
  tasksBoard: ['tasks', 'board'] as const,
  
  // Folders
  folders: ['folders'] as const,
  folder: (id: string) => ['folders', id] as const,
  
  // Notifications
  notifications: ['notifications'] as const,
  notificationsUnread: ['notifications', 'unread'] as const,
  
  // Shopping
  shoppingDictionary: ['shopping', 'dictionary'] as const,
  shoppingAutocomplete: (query: string) => ['shopping', 'autocomplete', query] as const,
  
  // Activity
  activity: ['activity'] as const,
  activitySummary: ['activity', 'summary'] as const,
  
  // Settings
  settings: ['settings'] as const,
  
  // User
  user: ['user'] as const,
  family: ['family'] as const,
  
  // Search
  search: ['search'] as const,
};

// Prefetch utilities
export const prefetchQueries = {
  // Prefetch user's lists when they login
  async userLists() {
    return queryClient.prefetchQuery({
      queryKey: cacheKeys.lists,
      queryFn: async () => {
        const response = await fetch('/api/lists');
        if (!response.ok) throw new Error('Failed to fetch lists');
        return response.json();
      },
    });
  },

  // Prefetch tasks for a specific list
  async listTasks(listId: string) {
    return queryClient.prefetchQuery({
      queryKey: cacheKeys.listTasks(listId),
      queryFn: async () => {
        const response = await fetch(`/api/tasks?listId=${listId}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return response.json();
      },
    });
  },

  // Prefetch notifications
  async notifications() {
    return queryClient.prefetchQuery({
      queryKey: cacheKeys.notifications,
      queryFn: async () => {
        const response = await fetch('/api/notifications');
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
      },
    });
  },
};

// Cache invalidation utilities
export const invalidateQueries = {
  // Invalidate all list-related queries
  lists() {
    queryClient.invalidateQueries({ queryKey: cacheKeys.lists });
  },
  
  // Invalidate specific list and its tasks
  list(listId: string) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.list(listId) });
    queryClient.invalidateQueries({ queryKey: cacheKeys.listTasks(listId) });
  },
  
  // Invalidate all task-related queries
  tasks() {
    queryClient.invalidateQueries({ queryKey: cacheKeys.tasks });
  },
  
  // Invalidate specific task
  task(taskId: string) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.task(taskId) });
  },
  
  // Invalidate tasks by list
  tasksByList(listId: string) {
    queryClient.invalidateQueries({ queryKey: cacheKeys.tasksByList(listId) });
    this.tasks(); // Also invalidate general tasks
  },
  
  // Invalidate notifications
  notifications() {
    queryClient.invalidateQueries({ queryKey: cacheKeys.notifications });
    queryClient.invalidateQueries({ queryKey: cacheKeys.notificationsUnread });
  },
  
  // Invalidate activity logs
  activity() {
    queryClient.invalidateQueries({ queryKey: cacheKeys.activity });
    queryClient.invalidateQueries({ queryKey: cacheKeys.activitySummary });
  },
};

// Optimistic update utilities
export const optimisticUpdates = {
  // Optimistically update task completion
  async completeTask(taskId: string, completed: boolean) {
    // Cancel outgoing queries for this task
    await queryClient.cancelQueries({ queryKey: cacheKeys.task(taskId) });
    await queryClient.cancelQueries({ queryKey: cacheKeys.tasks });

    // Snapshot the previous values
    const previousTask = queryClient.getQueryData(cacheKeys.task(taskId));
    const previousTasks = queryClient.getQueryData(cacheKeys.tasks);

    // Optimistically update task
    queryClient.setQueryData(cacheKeys.task(taskId), (old: any) => 
      old ? { ...old, completed } : old
    );

    // Optimistically update tasks list
    queryClient.setQueryData(cacheKeys.tasks, (old: any) => {
      if (!old?.tasks) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: any) =>
          task.id === taskId ? { ...task, completed } : task
        ),
      };
    });

    // Return rollback function
    return () => {
      queryClient.setQueryData(cacheKeys.task(taskId), previousTask);
      queryClient.setQueryData(cacheKeys.tasks, previousTasks);
    };
  },

  // Optimistically add new task
  async addTask(newTask: any) {
    await queryClient.cancelQueries({ queryKey: cacheKeys.tasks });
    
    const previousTasks = queryClient.getQueryData(cacheKeys.tasks);
    
    queryClient.setQueryData(cacheKeys.tasks, (old: any) => {
      if (!old?.tasks) return old;
      return {
        ...old,
        tasks: [...old.tasks, newTask],
        pagination: {
          ...old.pagination,
          total: old.pagination.total + 1,
        },
      };
    });

    return () => {
      queryClient.setQueryData(cacheKeys.tasks, previousTasks);
    };
  },

  // Optimistically update task
  async updateTask(taskId: string, updates: any) {
    await queryClient.cancelQueries({ queryKey: cacheKeys.task(taskId) });
    await queryClient.cancelQueries({ queryKey: cacheKeys.tasks });

    const previousTask = queryClient.getQueryData(cacheKeys.task(taskId));
    const previousTasks = queryClient.getQueryData(cacheKeys.tasks);

    // Update specific task
    queryClient.setQueryData(cacheKeys.task(taskId), (old: any) => 
      old ? { ...old, ...updates } : old
    );

    // Update task in tasks list
    queryClient.setQueryData(cacheKeys.tasks, (old: any) => {
      if (!old?.tasks) return old;
      return {
        ...old,
        tasks: old.tasks.map((task: any) =>
          task.id === taskId ? { ...task, ...updates } : task
        ),
      };
    });

    return () => {
      queryClient.setQueryData(cacheKeys.task(taskId), previousTask);
      queryClient.setQueryData(cacheKeys.tasks, previousTasks);
    };
  },
};

// Background cache warming
export const backgroundCacheWarming = {
  // Warm cache on app startup
  async onAppStart() {
    // Prefetch critical data in background
    await Promise.allSettled([
      prefetchQueries.userLists(),
      prefetchQueries.notifications(),
    ]);
  },

  // Warm cache when user navigates to specific pages
  async onNavigateToLists() {
    await prefetchQueries.userLists();
  },

  async onNavigateToList(listId: string) {
    await prefetchQueries.listTasks(listId);
  },
};

// Cache cleanup utilities
export const cacheCleanup = {
  // Clear all caches (useful for logout)
  clearAll() {
    queryClient.clear();
  },

  // Clear user-specific caches
  clearUserData() {
    queryClient.removeQueries({ queryKey: cacheKeys.lists });
    queryClient.removeQueries({ queryKey: cacheKeys.tasks });
    queryClient.removeQueries({ queryKey: cacheKeys.notifications });
    queryClient.removeQueries({ queryKey: cacheKeys.activity });
    queryClient.removeQueries({ queryKey: cacheKeys.settings });
    queryClient.removeQueries({ queryKey: cacheKeys.user });
    queryClient.removeQueries({ queryKey: cacheKeys.family });
  },

  // Remove stale shopping autocomplete queries
  clearStaleAutocomplete() {
    queryClient.removeQueries({
      queryKey: ['shopping', 'autocomplete'],
      predicate: (query) => {
        const lastUpdated = query.state.dataUpdatedAt;
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return lastUpdated < fiveMinutesAgo;
      },
    });
  },
};