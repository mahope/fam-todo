// Use browser performance API or Node.js perf_hooks
const getPerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    return window.performance;
  } else if (typeof require !== 'undefined') {
    try {
      const { performance } = require('perf_hooks');
      return performance;
    } catch {
      // Fallback for environments without perf_hooks
      return {
        now: () => Date.now(),
      };
    }
  }
  return {
    now: () => Date.now(),
  };
};

const performance = getPerformance();

// In-memory metrics storage for basic monitoring
interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

interface TimerMetric {
  name: string;
  startTime: number;
  labels?: Record<string, string>;
}

class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map();
  private timers: Map<string, TimerMetric> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();

  // Counter metrics
  incrementCounter(name: string, labels?: Record<string, string>, value: number = 1) {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.recordMetric({
      name,
      value: current + value,
      labels,
      timestamp: Date.now(),
    });
  }

  // Gauge metrics
  setGauge(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, value);
    
    this.recordMetric({
      name,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  // Histogram metrics
  recordHistogram(name: string, value: number, labels?: Record<string, string>) {
    const key = this.getMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);
    
    this.recordMetric({
      name,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  // Timer functions
  startTimer(name: string, labels?: Record<string, string>): string {
    const timerId = `${name}_${Date.now()}_${Math.random()}`;
    this.timers.set(timerId, {
      name,
      startTime: performance.now(),
      labels,
    });
    return timerId;
  }

  endTimer(timerId: string): number {
    const timer = this.timers.get(timerId);
    if (!timer) {
      throw new Error(`Timer ${timerId} not found`);
    }

    const duration = performance.now() - timer.startTime;
    this.timers.delete(timerId);
    
    this.recordHistogram(timer.name, duration, timer.labels);
    return duration;
  }

  // Measure function execution time
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    const timerId = this.startTimer(name, labels);
    try {
      const result = await fn();
      this.endTimer(timerId);
      return result;
    } catch (error) {
      this.endTimer(timerId);
      this.incrementCounter(`${name}_errors`, labels);
      throw error;
    }
  }

  measureSync<T>(
    name: string,
    fn: () => T,
    labels?: Record<string, string>
  ): T {
    const timerId = this.startTimer(name, labels);
    try {
      const result = fn();
      this.endTimer(timerId);
      return result;
    } catch (error) {
      this.endTimer(timerId);
      this.incrementCounter(`${name}_errors`, labels);
      throw error;
    }
  }

  // Get metrics
  getMetrics(): Record<string, any> {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);

    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: this.getHistogramStats(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: now,
      recentMetrics: this.getRecentMetrics(oneHourAgo),
    };
  }

  // Get HTTP request metrics
  getHttpMetrics() {
    const httpMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.includes('http_request'))
      .map(([key, metrics]) => {
        const recent = metrics.filter(m => m.timestamp > Date.now() - (5 * 60 * 1000)); // Last 5 minutes
        return {
          route: key,
          count: recent.length,
          avgDuration: recent.length > 0 ? recent.reduce((sum, m) => sum + m.value, 0) / recent.length : 0,
        };
      });

    return httpMetrics;
  }

  // Get database metrics
  getDbMetrics() {
    const dbMetrics = Array.from(this.metrics.entries())
      .filter(([key]) => key.includes('db_operation'))
      .map(([key, metrics]) => {
        const recent = metrics.filter(m => m.timestamp > Date.now() - (5 * 60 * 1000)); // Last 5 minutes
        return {
          operation: key,
          count: recent.length,
          avgDuration: recent.length > 0 ? recent.reduce((sum, m) => sum + m.value, 0) / recent.length : 0,
        };
      });

    return dbMetrics;
  }

  // Reset metrics (useful for testing)
  reset() {
    this.metrics.clear();
    this.timers.clear();
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  private recordMetric(metric: Metric) {
    const key = this.getMetricKey(metric.name, metric.labels);
    const metrics = this.metrics.get(key) || [];
    metrics.push(metric);
    
    // Keep only last 1000 metrics per key
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }
    
    this.metrics.set(key, metrics);
  }

  private getHistogramStats() {
    const stats: Record<string, any> = {};
    
    for (const [key, values] of this.histograms) {
      if (values.length === 0) continue;
      
      const sorted = [...values].sort((a, b) => a - b);
      stats[key] = {
        count: values.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: values.reduce((sum, v) => sum + v, 0) / values.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p90: sorted[Math.floor(sorted.length * 0.9)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      };
    }
    
    return stats;
  }

  private getRecentMetrics(since: number) {
    const recent: Record<string, Metric[]> = {};
    
    for (const [key, metrics] of this.metrics) {
      const recentMetrics = metrics.filter(m => m.timestamp >= since);
      if (recentMetrics.length > 0) {
        recent[key] = recentMetrics;
      }
    }
    
    return recent;
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Predefined metric helpers
export const httpMetrics = {
  requestDuration: (method: string, route: string, status: number, duration: number) => {
    metrics.recordHistogram('http_request_duration', duration, { method, route, status: status.toString() });
  },
  
  requestCount: (method: string, route: string, status: number) => {
    metrics.incrementCounter('http_requests_total', { method, route, status: status.toString() });
  },
  
  errorCount: (method: string, route: string, errorType: string) => {
    metrics.incrementCounter('http_errors_total', { method, route, error_type: errorType });
  },
};

export const dbMetrics = {
  queryDuration: (operation: string, table: string, duration: number) => {
    metrics.recordHistogram('db_query_duration', duration, { operation, table });
  },
  
  queryCount: (operation: string, table: string) => {
    metrics.incrementCounter('db_queries_total', { operation, table });
  },
  
  connectionCount: (pool: string, active: number) => {
    metrics.setGauge('db_connections_active', active, { pool });
  },
};

export const authMetrics = {
  loginAttempt: (success: boolean, method: string = 'password') => {
    metrics.incrementCounter('auth_login_attempts', { success: success.toString(), method });
  },
  
  sessionDuration: (duration: number, userId: string) => {
    metrics.recordHistogram('auth_session_duration', duration, { user_id: userId });
  },
  
  tokenRefresh: (success: boolean) => {
    metrics.incrementCounter('auth_token_refreshes', { success: success.toString() });
  },
};

export const businessMetrics = {
  taskCreated: (listType: string, userId: string) => {
    metrics.incrementCounter('tasks_created', { list_type: listType, user_id: userId });
  },
  
  taskCompleted: (listType: string, userId: string) => {
    metrics.incrementCounter('tasks_completed', { list_type: listType, user_id: userId });
  },
  
  listCreated: (visibility: string, userId: string) => {
    metrics.incrementCounter('lists_created', { visibility, user_id: userId });
  },
  
  userActivity: (action: string, userId: string) => {
    metrics.incrementCounter('user_activity', { action, user_id: userId });
  },
};