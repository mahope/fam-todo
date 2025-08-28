'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDownIcon, ChevronRightIcon, RefreshCwIcon } from 'lucide-react';
import { useApi } from '@/lib/api';

export default function DiagnosticsPanel() {
  const api = useApi();
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: diagnostics, isLoading, error, refetch } = useQuery({
    queryKey: ['diagnostics'],
    queryFn: async () => {
      const response = await api.get('/diagnostics');
      return response.data;
    },
    refetchOnMount: true,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-green-500';
      case 'ERROR': return 'bg-red-500';
      case 'NO_SESSION': return 'bg-yellow-500';
      case 'NOT_FOUND': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Temporarily show in production for debugging
  // if (process.env.NODE_ENV === 'production') {
  //   return null; // Hide in production
  // }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>Diagnostics</span>
                <div className="flex items-center gap-2">
                  {diagnostics && (
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(diagnostics.overallStatus)}
                    >
                      {diagnostics.overallStatus}
                    </Badge>
                  )}
                  {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
                </div>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {diagnostics?.timestamp && new Date(diagnostics.timestamp).toLocaleTimeString()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCwIcon size={12} className={isLoading ? 'animate-spin' : ''} />
                </Button>
              </div>

              {error && (
                <div className="text-red-600 text-xs p-2 bg-red-50 rounded">
                  Error: {error instanceof Error ? error.message : 'Unknown error'}
                </div>
              )}

              {diagnostics?.checks && Object.entries(diagnostics.checks).map(([key, check]: [string, any]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium capitalize">{key}</span>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(check.status)} text-xs`}
                    >
                      {check.status}
                    </Badge>
                  </div>
                  
                  {check.message && (
                    <p className="text-xs text-gray-600">{check.message}</p>
                  )}
                  
                  {/* Show additional details */}
                  {key === 'authentication' && check.userId && (
                    <p className="text-xs text-gray-500">User: {check.userId}</p>
                  )}
                  
                  {key === 'userData' && check.familyId && (
                    <p className="text-xs text-gray-500">
                      Family: {check.familyId} | Role: {check.role}
                    </p>
                  )}
                  
                  {key === 'listsQuery' && check.count !== undefined && (
                    <div className="text-xs text-gray-500">
                      <p>Count: {check.count}</p>
                      {check.sampleLists?.length > 0 && (
                        <p>Sample: {check.sampleLists.map((l: any) => l.name).join(', ')}</p>
                      )}
                    </div>
                  )}
                  
                  {key === 'environment' && check.variables && (
                    <div className="text-xs text-gray-500 space-y-1">
                      {Object.entries(check.variables).map(([envKey, value]) => (
                        <div key={envKey} className="flex justify-between">
                          <span>{envKey}:</span>
                          <span className={value === 'SET' ? 'text-green-600' : 'text-red-600'}>
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {diagnostics?.responseTime && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Response time: {diagnostics.responseTime}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}