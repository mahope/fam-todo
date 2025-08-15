import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/security/auth-middleware';
import { metrics } from '@/lib/monitoring/metrics';
import { SessionData } from '@/lib/auth/types';

export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      // Only admins can access metrics
      if (sessionData.role !== 'admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      const url = new URL(request.url);
      const format = url.searchParams.get('format') || 'json';
      const timeRange = url.searchParams.get('range') || '1h';

      // Get all metrics
      const allMetrics = metrics.getMetrics();
      
      // Get specific metric types
      const httpMetrics = metrics.getHttpMetrics();
      const dbMetrics = metrics.getDbMetrics();

      const response = {
        timestamp: new Date().toISOString(),
        timeRange,
        summary: {
          totalRequests: httpMetrics.reduce((sum, m) => sum + m.count, 0),
          avgRequestDuration: httpMetrics.length > 0 
            ? httpMetrics.reduce((sum, m) => sum + m.avgDuration, 0) / httpMetrics.length 
            : 0,
          totalDbOperations: dbMetrics.reduce((sum, m) => sum + m.count, 0),
          avgDbDuration: dbMetrics.length > 0 
            ? dbMetrics.reduce((sum, m) => sum + m.avgDuration, 0) / dbMetrics.length 
            : 0,
          uptime: allMetrics.uptime,
          memoryUsage: allMetrics.memory,
        },
        http: httpMetrics,
        database: dbMetrics,
        system: {
          uptime: allMetrics.uptime,
          memory: allMetrics.memory,
          counters: allMetrics.counters,
          gauges: allMetrics.gauges,
        },
        histograms: allMetrics.histograms,
      };

      if (format === 'prometheus') {
        // Convert to Prometheus format
        const prometheusFormat = convertToPrometheusFormat(response);
        return new NextResponse(prometheusFormat, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          },
        });
      }

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve metrics' },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);

function convertToPrometheusFormat(data: any): string {
  const lines: string[] = [];
  
  // Add help and type comments
  lines.push('# HELP famtodo_http_requests_total Total HTTP requests');
  lines.push('# TYPE famtodo_http_requests_total counter');
  
  // Add HTTP metrics
  data.http.forEach((metric: any) => {
    lines.push(`famtodo_http_requests_total{route="${metric.route}"} ${metric.count}`);
  });
  
  lines.push('# HELP famtodo_http_request_duration_seconds HTTP request duration');
  lines.push('# TYPE famtodo_http_request_duration_seconds histogram');
  
  data.http.forEach((metric: any) => {
    lines.push(`famtodo_http_request_duration_seconds{route="${metric.route}"} ${metric.avgDuration / 1000}`);
  });
  
  // Add system metrics
  lines.push('# HELP famtodo_memory_usage_bytes Memory usage in bytes');
  lines.push('# TYPE famtodo_memory_usage_bytes gauge');
  lines.push(`famtodo_memory_usage_bytes{type="rss"} ${data.system.memory.rss}`);
  lines.push(`famtodo_memory_usage_bytes{type="heapUsed"} ${data.system.memory.heapUsed}`);
  lines.push(`famtodo_memory_usage_bytes{type="heapTotal"} ${data.system.memory.heapTotal}`);
  
  lines.push('# HELP famtodo_uptime_seconds Process uptime in seconds');
  lines.push('# TYPE famtodo_uptime_seconds counter');
  lines.push(`famtodo_uptime_seconds ${data.system.uptime}`);
  
  // Add database metrics
  lines.push('# HELP famtodo_db_operations_total Database operations');
  lines.push('# TYPE famtodo_db_operations_total counter');
  
  data.database.forEach((metric: any) => {
    lines.push(`famtodo_db_operations_total{operation="${metric.operation}"} ${metric.count}`);
  });
  
  return lines.join('\n') + '\n';
}