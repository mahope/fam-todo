// Main monitoring exports - using consolidated logger
export { log, logger, logRequest, logError, logDbOperation, logAuth, logSecurity } from '@/lib/logger';
export { 
  metrics, 
  httpMetrics, 
  dbMetrics, 
  authMetrics, 
  businessMetrics 
} from './metrics';
export { 
  performanceMonitor, 
  PerformanceMonitor, 
  measurePerformance, 
  MemoryLeakDetector 
} from './performance';
export { 
  errorTracker, 
  captureError, 
  setupErrorTracking, 
  getErrorReports, 
  getErrorStats 
} from './error-tracking';
export { 
  withMonitoring, 
  withDbMonitoring, 
  withAuthMonitoring, 
  withCacheMonitoring, 
  withBusinessMetrics, 
  createMonitoringMiddleware 
} from './monitoring-middleware';

// Initialize monitoring system (server-side only)
export function initializeMonitoring() {
  // Only initialize on server side
  if (typeof window !== 'undefined') {
    return;
  }
  
  try {
    // Setup error tracking
    // setupErrorTracking();
    
    // Initialize performance monitoring
    // performanceMonitor.initialize();
    
    // Start memory leak detection
    // MemoryLeakDetector.startMonitoring();
    
    // Log initialization
    // logger.info('Monitoring system initialized', {
    //   environment: process.env.NODE_ENV,
    //   features: [
    //     'logging',
    //     'metrics',
    //     'performance',
    //     'error-tracking',
    //     'memory-monitoring',
    //   ],
    // });
  } catch (error) {
    // Use fallback console logging since main logger might not be available yet
    console.warn('Failed to initialize monitoring system:', error);
  }
}

// Cleanup monitoring resources
export function cleanupMonitoring() {
  // performanceMonitor.destroy();
  // MemoryLeakDetector.stopMonitoring();
  // errorTracker.destroy();
  
  // log.info('Monitoring system cleaned up');
}