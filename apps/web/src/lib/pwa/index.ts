// Main PWA exports and initialization
export {
  pwaInstallManager,
  networkManager,
  appUpdateManager,
  offlineStorageManager,
  pwaPerformanceMonitor,
} from './pwa-utils';

export {
  offlineManager,
  offlineUtils,
  type OfflineAction,
} from './offline-manager';

export {
  pwaPerformanceOptimizer,
  ResourceOptimizer,
  CodeSplittingOptimizer,
  ImageOptimizer,
  BundleOptimizer,
} from './performance-optimizer';

export {
  InstallPrompt,
  NetworkStatus,
  UpdateAvailable,
  PWAStatus,
} from '@/components/pwa/install-prompt';

import { offlineManager } from './offline-manager';
import { pwaPerformanceOptimizer } from './performance-optimizer';
import { log } from '@/lib/monitoring';

// Initialize PWA features
export async function initializePWA() {
  try {
    // Initialize offline manager
    await offlineManager.initialize();

    // Initialize performance optimizer
    await pwaPerformanceOptimizer.initialize();

    // Register service worker update handler
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          log.info('Service Worker registered', { scope: registration.scope });

          // Listen for service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  log.info('New app version available');
                }
              });
            }
          });
        } catch (error) {
          log.error('Service Worker registration failed', { error });
        }
      });
    }

    log.info('PWA features initialized successfully');
  } catch (error) {
    log.error('Failed to initialize PWA features', { error });
  }
}

// Cleanup PWA features
export function cleanupPWA() {
  try {
    pwaPerformanceOptimizer.destroy();
    log.info('PWA features cleaned up');
  } catch (error) {
    log.error('Failed to cleanup PWA features', { error });
  }
}