import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import type { List } from '@/lib/api';
import { logger } from '@/lib/logger';

export const LISTS_QUERY_KEY = 'lists';

export function useLists() {
  const api = useApi();
  
  return useQuery({
    queryKey: [LISTS_QUERY_KEY],
    queryFn: async () => {
      logger.info('useLists: Starting fetch');
      
      try {
        const response = await api.get('/lists');
        logger.info('useLists: API response received', { 
          hasData: !!response.data,
          dataType: typeof response.data,
          error: response.error 
        });
        
        // Check if we got HTML instead of JSON (indicates redirect to login)
        if (response.data && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          logger.error('useLists: Received HTML instead of JSON - authentication failed');
          throw new Error('Not authenticated - redirected to HTML page');
        }
        
        // Check if the response itself is an error object
        if (response.error || (response.data && typeof response.data === 'object' && 'error' in response.data)) {
          const errorMsg = response.error || response.data?.error || 'Unknown error';
          logger.error('useLists: API returned error', { error: errorMsg });
          throw new Error(errorMsg);
        }
        
        // Ensure we always return an array
        const data = response.data;
        const lists = Array.isArray(data) ? data as List[] : [];
        
        logger.info('useLists: Successfully processed data', { 
          listCount: lists.length,
          listIds: lists.map(l => l.id)
        });
        
        return lists;
      } catch (error) {
        logger.error('useLists: Query failed', { error: error instanceof Error ? error.message : error });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Enable background refetch for data freshness
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds when focused
    // Add better error handling
    retry: (failureCount, error) => {
      logger.info('useLists: Retry attempt', { failureCount, error: error.message });
      // Don't retry on authentication errors
      if (error.message.includes('Unauthorized') || error.message.includes('authentication')) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateList() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listData: any) => {
      const response = await api.post('/lists', listData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (newList) => {
      // Optimistically update the cache
      queryClient.setQueryData([LISTS_QUERY_KEY], (old: List[] | undefined) => {
        if (!old) return [newList];
        return [newList, ...old];
      });
    },
    onError: () => {
      // Invalidate and refetch on error
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}

export function useUpdateList(listId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<List>) => {
      const response = await api.patch(`/lists/${listId}`, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [LISTS_QUERY_KEY] });
      const previous = queryClient.getQueryData([LISTS_QUERY_KEY]);
      
      queryClient.setQueryData([LISTS_QUERY_KEY], (old: List[] | undefined) => {
        if (!old) return old;
        return old.map(list => 
          list.id === listId ? { ...list, ...updates } : list
        );
      });
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData([LISTS_QUERY_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}

export function useDeleteList(listId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/lists/${listId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onMutate: async () => {
      // Optimistic delete
      await queryClient.cancelQueries({ queryKey: [LISTS_QUERY_KEY] });
      const previous = queryClient.getQueryData([LISTS_QUERY_KEY]);
      
      queryClient.setQueryData([LISTS_QUERY_KEY], (old: List[] | undefined) => {
        if (!old) return old;
        return old.filter(list => list.id !== listId);
      });
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData([LISTS_QUERY_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}