// PWA utility functions for installation, updates, and offline support

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PWAInstallManager {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
  showInstallPrompt: () => Promise<boolean>;
  checkInstallability: () => void;
}

class PWAInstallManagerImpl implements PWAInstallManager {
  canInstall = false;
  isInstalled = false;
  isStandalone = false;
  installPrompt: BeforeInstallPromptEvent | null = null;

  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    // Check if running as standalone PWA
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true ||
                       document.referrer.includes('android-app://');

    // Check if already installed
    this.isInstalled = this.isStandalone || 
                       localStorage.getItem('pwa-installed') === 'true';

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as BeforeInstallPromptEvent;
      this.canInstall = true;
      this.notifyListeners();
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.canInstall = false;
      this.installPrompt = null;
      localStorage.setItem('pwa-installed', 'true');
      this.notifyListeners();
    });

    // Check for standalone mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.isStandalone = e.matches;
      this.isInstalled = e.matches;
      this.notifyListeners();
    });
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        this.isInstalled = true;
        this.canInstall = false;
        this.installPrompt = null;
        localStorage.setItem('pwa-installed', 'true');
        this.notifyListeners();
        return true;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    }

    return false;
  }

  checkInstallability() {
    // Force check for installability
    if (typeof window !== 'undefined') {
      // Check various PWA installation indicators
      const hasServiceWorker = 'serviceWorker' in navigator;
      const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
      const isHTTPS = location.protocol === 'https:' || location.hostname === 'localhost';
      
      console.log('PWA Installability Check:', {
        hasServiceWorker,
        hasManifest,
        isHTTPS,
        canInstall: this.canInstall,
        isInstalled: this.isInstalled,
        isStandalone: this.isStandalone,
      });
    }
  }

  addListener(callback: () => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback());
  }
}

export const pwaInstallManager = new PWAInstallManagerImpl();

// Network status management
export class NetworkManager {
  private static instance: NetworkManager;
  private isOnline = true;
  private listeners: Set<(online: boolean) => void> = new Set();

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      this.syncOfflineActions();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
    });
  }

  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: this.getConnectionType(),
      effectiveType: this.getEffectiveType(),
    };
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    return connection?.type || 'unknown';
  }

  private getEffectiveType(): string {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  addListener(callback: (online: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.isOnline));
  }

  private async syncOfflineActions() {
    // Notify service worker to sync offline actions
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SYNC_OFFLINE_ACTIONS'
      });
    }
  }
}

export const networkManager = NetworkManager.getInstance();

// App update management
export class AppUpdateManager {
  private static instance: AppUpdateManager;
  private updateAvailable = false;
  private listeners: Set<(updateAvailable: boolean) => void> = new Set();

  static getInstance(): AppUpdateManager {
    if (!AppUpdateManager.instance) {
      AppUpdateManager.instance = new AppUpdateManager();
    }
    return AppUpdateManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private async initialize() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyListeners();
            }
          });
        }
      });

      // Listen for controlled service worker change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute
    }
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  async applyUpdate(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    }
  }

  addListener(callback: (updateAvailable: boolean) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.updateAvailable));
  }
}

export const appUpdateManager = AppUpdateManager.getInstance();

// Offline storage management
export class OfflineStorageManager {
  private dbName = 'FamTodoOffline';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB not supported');
      return;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains('offline_actions')) {
          const store = db.createObjectStore('offline_actions', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('type', 'type');
        }

        if (!db.objectStoreNames.contains('cached_data')) {
          const store = db.createObjectStore('cached_data', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
          store.createIndex('type', 'type');
        }

        if (!db.objectStoreNames.contains('user_preferences')) {
          const store = db.createObjectStore('user_preferences', { keyPath: 'key' });
        }
      };
    });
  }

  async storeOfflineAction(action: {
    type: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    data?: any;
  }): Promise<void> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['offline_actions'], 'readwrite');
    const store = transaction.objectStore('offline_actions');

    await store.add({
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
  }

  async getOfflineActions(): Promise<any[]> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['offline_actions'], 'readonly');
    const store = transaction.objectStore('offline_actions');

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeOfflineAction(id: string): Promise<void> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['offline_actions'], 'readwrite');
    const store = transaction.objectStore('offline_actions');

    await store.delete(id);
  }

  async cacheData(key: string, data: any, type = 'general'): Promise<void> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['cached_data'], 'readwrite');
    const store = transaction.objectStore('cached_data');

    await store.put({
      key,
      data,
      type,
      timestamp: Date.now(),
    });
  }

  async getCachedData(key: string): Promise<any> {
    if (!this.db) await this.initialize();

    const transaction = this.db!.transaction(['cached_data'], 'readonly');
    const store = transaction.objectStore('cached_data');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data);
      request.onerror = () => reject(request.error);
    });
  }

  async clearExpiredCache(maxAge = 24 * 60 * 60 * 1000): Promise<void> {
    if (!this.db) await this.initialize();

    const cutoff = Date.now() - maxAge;
    const transaction = this.db!.transaction(['cached_data'], 'readwrite');
    const store = transaction.objectStore('cached_data');
    const index = store.index('timestamp');

    const range = IDBKeyRange.upperBound(cutoff);
    const request = index.openCursor(range);

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };
  }

  async getStorageUsage(): Promise<{ used: number; available: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        available: estimate.quota || 0,
      };
    }
    return { used: 0, available: 0 };
  }
}

export const offlineStorageManager = new OfflineStorageManager();

// Performance monitoring for PWA
export class PWAPerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();

  recordMetric(name: string, value: number) {
    const values = this.metrics.get(name) || [];
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
    
    this.metrics.set(name, values);
  }

  getMetrics() {
    const result: Record<string, any> = {};
    
    for (const [name, values] of this.metrics) {
      if (values.length === 0) continue;
      
      const sorted = [...values].sort((a, b) => a - b);
      result[name] = {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
      };
    }
    
    return result;
  }

  // Measure app start time
  measureAppStart() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        this.recordMetric('app_start_time', navigation.loadEventEnd - navigation.fetchStart);
        this.recordMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.fetchStart);
        this.recordMetric('first_paint', performance.getEntriesByName('first-paint')[0]?.startTime || 0);
        this.recordMetric('first_contentful_paint', performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0);
      });
    }
  }

  // Measure route transition time
  measureRouteTransition(routeName: string, startTime: number) {
    const endTime = performance.now();
    this.recordMetric(`route_transition_${routeName}`, endTime - startTime);
  }

  // Measure offline action sync time
  measureOfflineSync(actionCount: number, duration: number) {
    this.recordMetric('offline_sync_duration', duration);
    this.recordMetric('offline_sync_count', actionCount);
  }
}

export const pwaPerformanceMonitor = new PWAPerformanceMonitor();