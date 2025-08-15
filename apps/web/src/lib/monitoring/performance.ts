import { metrics } from './metrics';
import { log } from './logger';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private performanceObserver?: PerformanceObserver;

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Initialize performance monitoring
  initialize() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeBrowserMonitoring();
    } else {
      this.initializeServerMonitoring();
    }
  }

  // Server-side performance monitoring
  private initializeServerMonitoring() {
    // Monitor Node.js performance metrics
    setInterval(() => {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Memory metrics
      metrics.setGauge('node_memory_heap_used_bytes', memUsage.heapUsed);
      metrics.setGauge('node_memory_heap_total_bytes', memUsage.heapTotal);
      metrics.setGauge('node_memory_external_bytes', memUsage.external);
      metrics.setGauge('node_memory_rss_bytes', memUsage.rss);
      
      // CPU metrics (microseconds)
      metrics.setGauge('node_cpu_user_microseconds', cpuUsage.user);
      metrics.setGauge('node_cpu_system_microseconds', cpuUsage.system);
      
      // Event loop lag
      const start = process.hrtime.bigint();
      setImmediate(() => {
        const lag = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
        metrics.setGauge('node_eventloop_lag_milliseconds', lag);
      });
      
    }, 30000); // Every 30 seconds

    log.info('Server performance monitoring initialized');
  }

  // Browser-side performance monitoring
  private initializeBrowserMonitoring() {
    try {
      // Monitor navigation timing
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
      
      // Core Web Vitals
      this.observeCoreWebVitals();
      
      log.info('Browser performance monitoring initialized');
    } catch (error) {
      log.warn('Failed to initialize browser performance monitoring', { error: (error as Error).message });
    }
  }

  // Process performance entries
  private processPerformanceEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'navigation':
        this.processNavigationEntry(entry as PerformanceNavigationTiming);
        break;
      case 'resource':
        this.processResourceEntry(entry as PerformanceResourceTiming);
        break;
      case 'measure':
        this.processMeasureEntry(entry);
        break;
      case 'paint':
        this.processPaintEntry(entry);
        break;
    }
  }

  // Process navigation timing
  private processNavigationEntry(entry: PerformanceNavigationTiming) {
    const timings = {
      domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadComplete: entry.loadEventEnd - entry.loadEventStart,
      firstByte: entry.responseStart - entry.requestStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      totalLoad: entry.loadEventEnd - entry.navigationStart,
    };

    Object.entries(timings).forEach(([name, value]) => {
      if (value > 0) {
        metrics.recordHistogram(`browser_${name}_duration`, value);
      }
    });
  }

  // Process resource timing
  private processResourceEntry(entry: PerformanceResourceTiming) {
    const resourceType = this.getResourceType(entry.name);
    const duration = entry.responseEnd - entry.requestStart;
    
    if (duration > 0) {
      metrics.recordHistogram('browser_resource_duration', duration, { 
        type: resourceType,
        protocol: entry.nextHopProtocol || 'unknown'
      });
    }

    // Track slow resources
    if (duration > 1000) { // More than 1 second
      log.warn('Slow resource detected', {
        url: entry.name,
        duration,
        type: resourceType,
      });
    }
  }

  // Process custom measures
  private processMeasureEntry(entry: PerformanceEntry) {
    metrics.recordHistogram('browser_custom_measure', entry.duration, { 
      name: entry.name 
    });
  }

  // Process paint timing
  private processPaintEntry(entry: PerformanceEntry) {
    metrics.recordHistogram('browser_paint_timing', entry.startTime, { 
      type: entry.name 
    });
  }

  // Core Web Vitals monitoring
  private observeCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      metrics.recordHistogram('browser_lcp', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fid = entry.processingStart - entry.startTime;
        metrics.recordHistogram('browser_fid', fid);
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let cumulativeLayoutShift = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeLayoutShift += (entry as any).value;
        }
      }
      metrics.setGauge('browser_cls', cumulativeLayoutShift);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Get resource type from URL
  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  // Manual performance marking
  mark(name: string) {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  // Manual performance measuring
  measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined') {
      try {
        const measure = performance.measure(name, startMark, endMark);
        metrics.recordHistogram('custom_measure', measure.duration, { name });
        return measure.duration;
      } catch (error) {
        log.warn('Performance measure failed', { name, startMark, endMark, error: (error as Error).message });
      }
    }
    return 0;
  }

  // Cleanup
  destroy() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Performance decorators and utilities
export function measurePerformance(metricName: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const timerId = metrics.startTimer(metricName);
      
      try {
        const result = await originalMethod.apply(this, args);
        metrics.endTimer(timerId);
        return result;
      } catch (error) {
        metrics.endTimer(timerId);
        metrics.incrementCounter(`${metricName}_errors`);
        throw error;
      }
    };

    return descriptor;
  };
}

// Memory leak detection
export class MemoryLeakDetector {
  private static heapSizeHistory: number[] = [];
  private static checkInterval: NodeJS.Timeout | null = null;

  static startMonitoring(intervalMs: number = 60000) {
    if (this.checkInterval) {
      return; // Already monitoring
    }

    this.checkInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      this.heapSizeHistory.push(memUsage.heapUsed);
      
      // Keep only last 30 measurements
      if (this.heapSizeHistory.length > 30) {
        this.heapSizeHistory.shift();
      }

      // Check for potential memory leaks
      if (this.heapSizeHistory.length >= 10) {
        const trend = this.calculateTrend();
        if (trend > 0.1) { // 10% increase trend
          log.warn('Potential memory leak detected', {
            heapUsed: memUsage.heapUsed,
            trend,
            history: this.heapSizeHistory.slice(-5),
          });
        }
      }
    }, intervalMs);
  }

  static stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private static calculateTrend(): number {
    if (this.heapSizeHistory.length < 2) return 0;
    
    const first = this.heapSizeHistory[0];
    const last = this.heapSizeHistory[this.heapSizeHistory.length - 1];
    
    return (last - first) / first;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();