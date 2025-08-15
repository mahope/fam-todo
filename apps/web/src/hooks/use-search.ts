import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/lib/performance/cache';

interface SearchResult {
  tasks: any[];
  lists: any[];
  folders: any[];
  query: string;
  total: number;
}

interface UseSearchOptions {
  enabled?: boolean;
  type?: 'all' | 'tasks' | 'lists' | 'folders';
  limit?: number;
  debounceMs?: number;
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const {
    enabled = true,
    type = 'all',
    limit = 20,
    debounceMs = 300,
  } = options;

  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...cacheKeys.search, debouncedQuery, type, limit],
    queryFn: async (): Promise<SearchResult> => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return {
          tasks: [],
          lists: [],
          folders: [],
          query: debouncedQuery,
          total: 0,
        };
      }

      const params = new URLSearchParams({
        q: debouncedQuery,
        type,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      return response.json();
    },
    enabled: enabled && debouncedQuery.length >= 2,
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  return {
    data: data || {
      tasks: [],
      lists: [],
      folders: [],
      query: debouncedQuery,
      total: 0,
    },
    isLoading: isLoading && debouncedQuery.length >= 2,
    error,
    refetch,
    debouncedQuery,
  };
}