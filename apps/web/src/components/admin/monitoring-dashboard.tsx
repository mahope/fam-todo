'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Database, 
  Server, 
  Users, 
  Zap,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

interface MetricsData {
  timestamp: string;
  summary: {
    totalRequests: number;
    avgRequestDuration: number;
    totalDbOperations: number;
    avgDbDuration: number;
    uptime: number;
    memoryUsage: {
      rss: number;
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
  };
  http: Array<{
    route: string;
    count: number;
    avgDuration: number;
  }>;
  database: Array<{
    operation: string;
    count: number;
    avgDuration: number;
  }>;
  system: {
    uptime: number;
    memory: any;
    counters: Record<string, number>;
    gauges: Record<string, number>;
  };
}

interface ErrorData {
  reports: Array<{
    id: string;
    message: string;
    name: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    count: number;
    firstSeen: string;
    lastSeen: string;
    context: {
      route?: string;
      method?: string;
    };
  }>;
  stats: {
    total: number;
    byName: Record<string, number>;
    bySeverity: Record<string, number>;
    byRoute: Record<string, number>;
    recentErrors: number;
  };
}

export function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [errors, setErrors] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMetrics = async () => {
    try {
      const [metricsRes, errorsRes] = await Promise.all([
        fetch('/api/metrics'),
        fetch('/api/errors?stats=true')
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (errorsRes.ok) {
        const errorsData = await errorsRes.json();
        setErrors(errorsData);
      }
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time application metrics and error tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests/5min</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary.totalRequests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {metrics?.summary.avgRequestDuration?.toFixed(1) || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Operations</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.summary.totalDbOperations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Avg: {metrics?.summary.avgDbDuration?.toFixed(1) || 0}ms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(metrics?.summary.memoryUsage.heapUsed || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              of {formatBytes(metrics?.summary.memoryUsage.heapTotal || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errors?.stats.recentErrors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total: {errors?.stats.total || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Routes</CardTitle>
                <CardDescription>Most active API endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.http.slice(0, 5).map((route, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-mono text-sm">{route.route}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{route.count}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {route.avgDuration.toFixed(1)}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Operations</CardTitle>
                <CardDescription>Recent database activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics?.database.slice(0, 5).map((op, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="font-mono text-sm">{op.operation}</div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{op.count}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {op.avgDuration.toFixed(1)}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium">Uptime</div>
                  <div className="text-2xl font-bold">
                    {formatUptime(metrics?.summary.uptime || 0)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Memory</div>
                  <div className="space-y-1">
                    <div className="text-sm">
                      RSS: {formatBytes(metrics?.summary.memoryUsage.rss || 0)}
                    </div>
                    <div className="text-sm">
                      Heap: {formatBytes(metrics?.summary.memoryUsage.heapUsed || 0)}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Status</div>
                  <Badge variant="default" className="bg-green-500">
                    Healthy
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>Recent application errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {Object.entries(errors?.stats.bySeverity || {}).map(([severity, count]) => (
                  <div key={severity} className="text-center">
                    <div className={`w-full h-2 rounded mb-2 ${getSeverityColor(severity)}`} />
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{severity}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>Latest error reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errors?.reports.slice(0, 10).map((error) => (
                  <Alert key={error.id}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{error.message}</div>
                          <div className="text-sm text-muted-foreground">
                            {error.context.route} • {error.context.method} • {error.count} times
                          </div>
                        </div>
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
                <CardDescription>Current memory allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>RSS</span>
                    <span>{formatBytes(metrics?.summary.memoryUsage.rss || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heap Used</span>
                    <span>{formatBytes(metrics?.summary.memoryUsage.heapUsed || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heap Total</span>
                    <span>{formatBytes(metrics?.summary.memoryUsage.heapTotal || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>External</span>
                    <span>{formatBytes(metrics?.summary.memoryUsage.external || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metrics</CardTitle>
                <CardDescription>System counters and gauges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metrics?.system.counters || {}).slice(0, 8).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm font-mono">{key}</span>
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}