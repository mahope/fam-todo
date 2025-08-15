'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Zap, 
  TrendingUp, 
  Server, 
  Database,
  Wifi,
  RefreshCw,
} from 'lucide-react';
import { performanceMonitor } from '@/lib/performance/monitoring';
import { queryClient } from '@/lib/performance/cache';

interface PerformanceSummary {
  coreWebVitals: {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
  };
  loading: {
    ttfb: number | null;
    domLoad: number | null;
    fullLoad: number | null;
  };
  api: {
    averageResponseTime: number;
    slowQueries: number;
    errorRate: number;
  };
  custom: Record<string, number>;
}

export default function PerformanceDashboard() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  const refreshData = () => {
    const newSummary = performanceMonitor.getSummary();
    setSummary(newSummary);

    // Get cache statistics
    const cacheData = queryClient.getQueryCache();
    const queries = cacheData.getAll();
    
    setCacheStats({
      totalQueries: queries.length,
      staleLQueries: queries.filter(q => q.isStale()).length,
      activeQueries: queries.filter(q => q.state.fetchStatus === 'fetching').length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      cacheSize: queries.reduce((total, query) => {
        return total + (JSON.stringify(query.state.data || {}).length || 0);
      }, 0),
    });
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);
    setRefreshInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getScoreColor = (metric: string, value: number | null) => {
    if (value === null) return 'text-gray-500';
    
    switch (metric) {
      case 'lcp':
        return value <= 2500 ? 'text-green-600' : value <= 4000 ? 'text-yellow-600' : 'text-red-600';
      case 'fid':
        return value <= 100 ? 'text-green-600' : value <= 300 ? 'text-yellow-600' : 'text-red-600';
      case 'cls':
        return value <= 0.1 ? 'text-green-600' : value <= 0.25 ? 'text-yellow-600' : 'text-red-600';
      case 'ttfb':
        return value <= 200 ? 'text-green-600' : value <= 500 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-700';
    }
  };

  const getScoreProgress = (metric: string, value: number | null) => {
    if (value === null) return 0;
    
    switch (metric) {
      case 'lcp':
        return Math.min((4000 - value) / 4000 * 100, 100);
      case 'fid':
        return Math.min((300 - value) / 300 * 100, 100);
      case 'cls':
        return Math.min((0.25 - value) / 0.25 * 100, 100);
      case 'ttfb':
        return Math.min((500 - value) / 500 * 100, 100);
      default:
        return 50;
    }
  };

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
          <p className="text-gray-600">Monitor app performance and user experience metrics</p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Opdater
        </Button>
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="loading">Loading Performance</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="cache">Cache Statistics</TabsTrigger>
        </TabsList>

        {/* Core Web Vitals */}
        <TabsContent value="vitals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Largest Contentful Paint
                </CardTitle>
                <CardDescription>Tid til største indhold</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor('lcp', summary.coreWebVitals.lcp)}`}>
                  {summary.coreWebVitals.lcp ? `${Math.round(summary.coreWebVitals.lcp)}ms` : 'N/A'}
                </div>
                <Progress 
                  value={getScoreProgress('lcp', summary.coreWebVitals.lcp)} 
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Godt: ≤2.5s | Skal forbedres: ≤4.0s
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4" />
                  First Input Delay
                </CardTitle>
                <CardDescription>Reaktionstid på første input</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor('fid', summary.coreWebVitals.fid)}`}>
                  {summary.coreWebVitals.fid ? `${Math.round(summary.coreWebVitals.fid)}ms` : 'N/A'}
                </div>
                <Progress 
                  value={getScoreProgress('fid', summary.coreWebVitals.fid)} 
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Godt: ≤100ms | Skal forbedres: ≤300ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Cumulative Layout Shift
                </CardTitle>
                <CardDescription>Visuel stabilitet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor('cls', summary.coreWebVitals.cls)}`}>
                  {summary.coreWebVitals.cls ? summary.coreWebVitals.cls.toFixed(3) : 'N/A'}
                </div>
                <Progress 
                  value={getScoreProgress('cls', summary.coreWebVitals.cls)} 
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Godt: ≤0.1 | Skal forbedres: ≤0.25
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loading Performance */}
        <TabsContent value="loading" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Server className="h-4 w-4" />
                  Time to First Byte
                </CardTitle>
                <CardDescription>Server responstid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getScoreColor('ttfb', summary.loading.ttfb)}`}>
                  {summary.loading.ttfb ? `${Math.round(summary.loading.ttfb)}ms` : 'N/A'}
                </div>
                <Progress 
                  value={getScoreProgress('ttfb', summary.loading.ttfb)} 
                  className="mt-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Godt: ≤200ms | Skal forbedres: ≤500ms
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Database className="h-4 w-4" />
                  DOM Load Time
                </CardTitle>
                <CardDescription>Tid til DOM klar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">
                  {summary.loading.domLoad ? `${Math.round(summary.loading.domLoad)}ms` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tid til DOMContentLoaded event
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4" />
                  Full Load Time
                </CardTitle>
                <CardDescription>Total indlæsningstid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-700">
                  {summary.loading.fullLoad ? `${Math.round(summary.loading.fullLoad)}ms` : 'N/A'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Tid til alle ressourcer indlæst
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Performance */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Gennemsnitlig Responstid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(summary.api.averageResponseTime)}ms
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Sidste 5 minutter
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Langsomme Forespørgsler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {summary.api.slowQueries}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  &gt;1000ms responstid
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Fejlrate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {summary.api.errorRate.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  4xx/5xx HTTP status koder
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Cache Statistics */}
        <TabsContent value="cache" className="space-y-4">
          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Samlede Forespørgsler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {cacheStats.totalQueries}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    I cache lige nu
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Aktive Forespørgsler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {cacheStats.activeQueries}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Henter data lige nu
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Forældede Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {cacheStats.staleLQueries}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Klar til genindlæsning
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Cache Størrelse</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatBytes(cacheStats.cacheSize)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    I hukommelse
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Custom Metrics */}
      {Object.keys(summary.custom).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Brugerdefinerede Metrics
            </CardTitle>
            <CardDescription>
              App-specifikke performance målinger
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(summary.custom).map(([name, value]) => (
                <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium capitalize">{name.replace(/_/g, ' ')}</span>
                  <Badge variant="outline">{Math.round(value)}ms</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}