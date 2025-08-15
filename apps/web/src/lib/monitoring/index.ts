// Main monitoring exports
export { log, logger, logRequest, logError, logDbOperation, logAuth, logSecurity } from './logger';
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

// Initialize monitoring system
export function initializeMonitoring() {
  // Setup error tracking
  setupErrorTracking();
  
  // Initialize performance monitoring
  performanceMonitor.initialize();
  
  // Start memory leak detection
  MemoryLeakDetector.startMonitoring();
  
  // Log initialization
  log.info('Monitoring system initialized', {
    environment: process.env.NODE_ENV,
    features: [
      'logging',
      'metrics',
      'performance',
      'error-tracking',
      'memory-monitoring',
    ],
  });
}

// Cleanup monitoring resources
export function cleanupMonitoring() {
  performanceMonitor.destroy();
  MemoryLeakDetector.stopMonitoring();
  errorTracker.destroy();
  
  log.info('Monitoring system cleaned up');
}