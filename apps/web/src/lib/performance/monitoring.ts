// Performance monitoring utilities for FamTodo
import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ApiMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  size?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: ApiMetric[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Observe Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('LCP', entry.startTime, {
            element: (entry as any).element,
            url: (entry as any).url,
          });
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('FID', (entry as any).processingStart - entry.startTime, {
            name: entry.name,
          });
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        if (clsValue > 0) {
          this.recordMetric('CLS', clsValue);
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      // Navigation timing
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          if (navigation) {
            this.recordMetric('TTFB', navigation.responseStart - navigation.requestStart);
            this.recordMetric('DOM_LOAD', navigation.domContentLoadedEventEnd - navigation.navigationStart);
            this.recordMetric('FULL_LOAD', navigation.loadEventEnd - navigation.navigationStart);
          }
        }, 0);
      });
    }
  }

  // Record a custom performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last 100 metrics to prevent memory leaks
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${name} = ${value}ms`, metadata);
    }

    // Send to analytics in production (if configured)
    if (process.env.NODE_ENV === 'production' && this.shouldReportMetric(name)) {
      this.sendToAnalytics(metric);
    }
  }

  // Record API call performance
  recordApiCall(endpoint: string, method: string, duration: number, status: number, size?: number) {
    const apiMetric: ApiMetric = {
      endpoint: this.sanitizeEndpoint(endpoint),
      method,
      duration,
      status,
      timestamp: Date.now(),
      size,
    };

    this.apiMetrics.push(apiMetric);

    // Keep only last 50 API metrics
    if (this.apiMetrics.length > 50) {
      this.apiMetrics.shift();
    }

    // Log slow API calls
    if (duration > 1000) {
      console.warn(`Slow API call: ${method} ${endpoint} took ${duration}ms`);
    }
  }

  // Time a function execution
  async time<T>(name: string, fn: () => Promise<T> | T, metadata?: Record<string, any>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(name, duration, metadata);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(name, duration, { ...metadata, error: true });
      throw error;
    }
  }

  // Create a timing marker
  mark(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  }

  // Measure between two markers
  measure(name: string, startMark: string, endMark?: string) {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
          this.recordMetric(name, measure.duration);
        }
      } catch (error) {
        console.warn('Failed to measure performance:', error);
      }
    }
  }

  // Get performance summary
  getSummary() {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;

    const recentMetrics = this.metrics.filter(m => m.timestamp > last5Minutes);
    const recentApiMetrics = this.apiMetrics.filter(m => m.timestamp > last5Minutes);

    const summary = {
      coreWebVitals: {
        lcp: this.getLatestMetric('LCP'),
        fid: this.getLatestMetric('FID'),
        cls: this.getLatestMetric('CLS'),
      },
      loading: {
        ttfb: this.getLatestMetric('TTFB'),
        domLoad: this.getLatestMetric('DOM_LOAD'),
        fullLoad: this.getLatestMetric('FULL_LOAD'),
      },
      api: {
        averageResponseTime: this.calculateAverageApiTime(recentApiMetrics),
        slowQueries: recentApiMetrics.filter(m => m.duration > 1000).length,
        errorRate: this.calculateApiErrorRate(recentApiMetrics),
      },
      custom: recentMetrics
        .filter(m => !['LCP', 'FID', 'CLS', 'TTFB', 'DOM_LOAD', 'FULL_LOAD'].includes(m.name))
        .reduce((acc, metric) => {
          acc[metric.name] = metric.value;
          return acc;
        }, {} as Record<string, number>),
    };

    return summary;
  }

  // Get latest value for a specific metric
  private getLatestMetric(name: string): number | null {
    const metric = this.metrics
      .filter(m => m.name === name)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
    return metric ? metric.value : null;
  }

  // Calculate average API response time
  private calculateAverageApiTime(apiMetrics: ApiMetric[]): number {
    if (apiMetrics.length === 0) return 0;
    const total = apiMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return total / apiMetrics.length;
  }

  // Calculate API error rate
  private calculateApiErrorRate(apiMetrics: ApiMetric[]): number {
    if (apiMetrics.length === 0) return 0;
    const errors = apiMetrics.filter(m => m.status >= 400).length;
    return (errors / apiMetrics.length) * 100;
  }

  // Sanitize endpoint for privacy
  private sanitizeEndpoint(endpoint: string): string {
    // Replace UUIDs with placeholder
    return endpoint.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id');
  }

  // Determine if metric should be reported
  private shouldReportMetric(name: string): boolean {
    // Only report Core Web Vitals and custom business metrics
    const reportableMetrics = ['LCP', 'FID', 'CLS', 'TTFB', 'DOM_LOAD', 'task_creation', 'list_load'];
    return reportableMetrics.includes(name);
  }

  // Send metrics to analytics service
  private sendToAnalytics(metric: PerformanceMetric) {
    // Implement analytics reporting here
    // Could use Google Analytics, custom endpoint, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        custom_parameter: metric.metadata,
      });
    }
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Performance monitoring hooks for React components
export const usePerformanceMonitor = () => {
  const monitor = performanceMonitor;

  return {
    recordMetric: monitor.recordMetric.bind(monitor),
    time: monitor.time.bind(monitor),
    mark: monitor.mark.bind(monitor),
    measure: monitor.measure.bind(monitor),
    getSummary: monitor.getSummary.bind(monitor),
  };
};

// API fetch wrapper with performance monitoring
export const monitoredFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const start = performance.now();
  const method = options.method || 'GET';

  try {
    const response = await fetch(url, options);
    const duration = performance.now() - start;
    
    performanceMonitor.recordApiCall(
      url,
      method,
      duration,
      response.status,
      parseInt(response.headers.get('content-length') || '0')
    );

    return response;
  } catch (error) {
    const duration = performance.now() - start;
    performanceMonitor.recordApiCall(url, method, duration, 0);
    throw error;
  }
};

// Component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return React.forwardRef<any, P>((props, ref) => {
    React.useEffect(() => {
      const mountTime = performance.now();
      performanceMonitor.mark(`${componentName}_mount_start`);

      return () => {
        const unmountTime = performance.now();
        performanceMonitor.recordMetric(
          `${componentName}_mount_duration`,
          unmountTime - mountTime
        );
      };
    }, []);

    return React.createElement(Component, { ...props, ref });
  });
}

// Lazy loading performance helper
export const measureLazyLoad = (componentName: string) => {
  return {
    onLoadStart: () => performanceMonitor.mark(`${componentName}_lazy_start`),
    onLoadComplete: () => {
      performanceMonitor.mark(`${componentName}_lazy_complete`);
      performanceMonitor.measure(
        `${componentName}_lazy_duration`,
        `${componentName}_lazy_start`,
        `${componentName}_lazy_complete`
      );
    },
  };
};

// Bundle size monitoring
export const reportBundleSize = () => {
  if (typeof window !== 'undefined' && 'navigator' in window) {
    // Use Resource Timing API to get bundle sizes
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    resources
      .filter(resource => resource.name.includes('/_next/static/'))
      .forEach(resource => {
        performanceMonitor.recordMetric(
          'bundle_size',
          resource.transferSize || 0,
          {
            resource: resource.name,
            type: resource.name.includes('.js') ? 'javascript' : 'other',
          }
        );
      });
  }
};

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Initialize performance monitoring on app start
export const initPerformanceMonitoring = () => {
  if (typeof window !== 'undefined') {
    // Report initial bundle sizes
    window.addEventListener('load', () => {
      setTimeout(reportBundleSize, 1000);
    });

    // Monitor router changes for SPA navigation timing
    if (typeof window !== 'undefined' && 'history' in window) {
      const originalPushState = history.pushState;
      history.pushState = function(...args) {
        performanceMonitor.mark('navigation_start');
        originalPushState.apply(history, args);
      };
    }
  }
};

export default performanceMonitor;