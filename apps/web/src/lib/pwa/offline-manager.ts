import { offlineStorageManager } from './pwa-utils';

// Import monitoring only on server side or fallback to console
let log: any;
if (typeof window === 'undefined') {
  try {
    const monitoring = require('@/lib/monitoring');
    log = monitoring.log;
  } catch {
    log = { info: console.log, error: console.error, warn: console.warn, debug: console.log };
  }
} else {
  log = { info: console.log, error: console.error, warn: console.warn, debug: console.log };
}

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'task' | 'list' | 'folder' | 'user';
  entityId?: string;
  data: any;
  url: string;
  method: string;
  headers: Record<string, string>;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export class OfflineManager {
  private static instance: OfflineManager;
  private syncInProgress = false;
  private syncQueue: OfflineAction[] = [];

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  async initialize() {
    await offlineStorageManager.initialize();
    
    // Load existing offline actions
    this.syncQueue = await offlineStorageManager.getOfflineActions();
    
    // Listen for online events to trigger sync
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.syncOfflineActions();
      });
    }

    log.info('Offline manager initialized', { queueSize: this.syncQueue.length });
  }

  // Queue an action for offline execution
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: action.maxRetries || 3,
    };

    // Add to memory queue
    this.syncQueue.push(offlineAction);

    // Store in IndexedDB
    await offlineStorageManager.storeOfflineAction(offlineAction);

    log.info('Action queued for offline sync', {
      actionId: offlineAction.id,
      type: offlineAction.type,
      entity: offlineAction.entity,
    });

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncOfflineActions();
    }
  }

  // Sync all offline actions
  async syncOfflineActions(): Promise<void> {
    if (this.syncInProgress || !navigator.onLine || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const startTime = performance.now();
    const originalQueueSize = this.syncQueue.length;

    log.info('Starting offline sync', { queueSize: originalQueueSize });

    try {
      const actionsToRetry: OfflineAction[] = [];

      for (const action of this.syncQueue) {
        try {
          await this.executeAction(action);
          
          // Remove successful action from storage
          await offlineStorageManager.removeOfflineAction(action.id);
          
          log.info('Offline action synced successfully', {
            actionId: action.id,
            type: action.type,
            entity: action.entity,
          });
        } catch (error) {
          action.retryCount++;
          
          if (action.retryCount < action.maxRetries) {
            actionsToRetry.push(action);
            log.warn('Offline action failed, will retry', {
              actionId: action.id,
              retryCount: action.retryCount,
              maxRetries: action.maxRetries,
              error: error instanceof Error ? error.message : String(error),
            });
          } else {
            // Max retries reached, remove from storage
            await offlineStorageManager.removeOfflineAction(action.id);
            log.error('Offline action failed permanently', {
              actionId: action.id,
              retryCount: action.retryCount,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      // Update queue with failed actions that can be retried
      this.syncQueue = actionsToRetry;

      const duration = performance.now() - startTime;
      const syncedCount = originalQueueSize - actionsToRetry.length;

      log.info('Offline sync completed', {
        duration: `${duration.toFixed(2)}ms`,
        syncedCount,
        remainingCount: actionsToRetry.length,
      });

    } catch (error) {
      log.error('Offline sync failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  // Execute a single offline action
  private async executeAction(action: OfflineAction): Promise<void> {
    const response = await fetch(action.url, {
      method: action.method,
      headers: {
        'Content-Type': 'application/json',
        ...action.headers,
      },
      body: action.data ? JSON.stringify(action.data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle response based on action type
    const responseData = await response.json();
    
    // Update local cache with response data
    await this.updateLocalCache(action, responseData);
  }

  // Update local cache with synced data
  private async updateLocalCache(action: OfflineAction, responseData: any): Promise<void> {
    const cacheKey = `${action.entity}_${action.entityId || 'list'}`;
    
    try {
      switch (action.type) {
        case 'create':
          // Cache the created entity
          if (responseData.data) {
            await offlineStorageManager.cacheData(
              `${action.entity}_${responseData.data.id}`,
              responseData.data,
              action.entity
            );
          }
          break;
          
        case 'update':
          // Update cached entity
          if (responseData.data && action.entityId) {
            await offlineStorageManager.cacheData(
              `${action.entity}_${action.entityId}`,
              responseData.data,
              action.entity
            );
          }
          break;
          
        case 'delete':
          // Remove from cache
          if (action.entityId) {
            // Note: We don't have a direct delete method, so we'll cache null
            await offlineStorageManager.cacheData(
              `${action.entity}_${action.entityId}`,
              null,
              action.entity
            );
          }
          break;
      }
    } catch (error) {
      log.warn('Failed to update local cache', {
        actionId: action.id,
        cacheKey,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Get pending actions count
  getPendingActionsCount(): number {
    return this.syncQueue.length;
  }

  // Get pending actions by type
  getPendingActionsByType(entityType: string): OfflineAction[] {
    return this.syncQueue.filter(action => action.entity === entityType);
  }

  // Clear all pending actions (for testing or error recovery)
  async clearAllPendingActions(): Promise<void> {
    for (const action of this.syncQueue) {
      await offlineStorageManager.removeOfflineAction(action.id);
    }
    this.syncQueue = [];
    
    log.info('All pending offline actions cleared');
  }

  // Check if entity has pending changes
  hasPendingChanges(entityType: string, entityId: string): boolean {
    return this.syncQueue.some(action => 
      action.entity === entityType && action.entityId === entityId
    );
  }

  // Get optimistic data for entity (local changes not yet synced)
  getOptimisticData(entityType: string, entityId: string): any {
    const pendingActions = this.syncQueue
      .filter(action => action.entity === entityType && action.entityId === entityId)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (pendingActions.length === 0) {
      return null;
    }

    // Apply pending changes in order
    let optimisticData = null;
    for (const action of pendingActions) {
      switch (action.type) {
        case 'create':
        case 'update':
          optimisticData = { ...optimisticData, ...action.data };
          break;
        case 'delete':
          optimisticData = null;
          break;
      }
    }

    return optimisticData;
  }
}

export const offlineManager = OfflineManager.getInstance();

// Utility functions for common offline operations
export const offlineUtils = {
  // Create task offline
  createTaskOffline: async (taskData: any, listId: string) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await offlineManager.queueAction({
      type: 'create',
      entity: 'task',
      data: { ...taskData, listId },
      url: '/api/tasks',
      method: 'POST',
      headers: {},
      maxRetries: 3,
    });

    // Return optimistic data
    return {
      id: tempId,
      ...taskData,
      listId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _isPending: true,
    };
  },

  // Update task offline
  updateTaskOffline: async (taskId: string, updates: any) => {
    await offlineManager.queueAction({
      type: 'update',
      entity: 'task',
      entityId: taskId,
      data: updates,
      url: `/api/tasks/${taskId}`,
      method: 'PATCH',
      headers: {},
      maxRetries: 3,
    });

    return { ...updates, updatedAt: new Date().toISOString(), _isPending: true };
  },

  // Delete task offline
  deleteTaskOffline: async (taskId: string) => {
    await offlineManager.queueAction({
      type: 'delete',
      entity: 'task',
      entityId: taskId,
      data: null,
      url: `/api/tasks/${taskId}`,
      method: 'DELETE',
      headers: {},
      maxRetries: 3,
    });

    return { _isDeleted: true, _isPending: true };
  },

  // Create list offline
  createListOffline: async (listData: any) => {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await offlineManager.queueAction({
      type: 'create',
      entity: 'list',
      data: listData,
      url: '/api/lists',
      method: 'POST',
      headers: {},
      maxRetries: 3,
    });

    return {
      id: tempId,
      ...listData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _isPending: true,
    };
  },

  // Update list offline
  updateListOffline: async (listId: string, updates: any) => {
    await offlineManager.queueAction({
      type: 'update',
      entity: 'list',
      entityId: listId,
      data: updates,
      url: `/api/lists/${listId}`,
      method: 'PATCH',
      headers: {},
      maxRetries: 3,
    });

    return { ...updates, updatedAt: new Date().toISOString(), _isPending: true };
  },
};