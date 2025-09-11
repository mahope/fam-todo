// Simplified client-side hooks using unified types
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { 
  ListWithRelations,
  ListWithDetails,
  ListsResponse,
  CreateListRequest,
  UpdateListRequest,
  ListQueryOptions,
  isListError,
  isListsResponse,
  isListWithDetails
} from '@/lib/types/list';

export const LISTS_QUERY_KEY = 'lists';
export const LIST_QUERY_KEY = 'list';

export function useLists(options: ListQueryOptions = {}) {
  const api = useApi();
  
  return useQuery({
    queryKey: [LISTS_QUERY_KEY, options],
    queryFn: async () => {
      logger.info('useLists: Starting fetch', { options });
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (options.listType) params.set('listType', options.listType);
        if (options.folderId !== undefined) params.set('folderId', options.folderId || '');
        if (options.visibility) params.set('visibility', options.visibility);
        if (options.search) params.set('search', options.search);
        if (options.orderBy) params.set('orderBy', options.orderBy);
        if (options.orderDirection) params.set('orderDirection', options.orderDirection);
        
        const endpoint = params.toString() ? `/lists?${params.toString()}` : '/lists';
        const response = await api.get(endpoint);
        
        logger.info('useLists: API response received', { 
          hasData: !!response.data,
          error: response.error 
        });
        
        // Check for HTML response (auth redirect)
        if (response.data && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          logger.error('useLists: Received HTML instead of JSON - authentication failed');
          throw new Error('Not authenticated');
        }
        
        // Check for API error
        if (response.error) {
          logger.error('useLists: API returned error', { error: response.error });
          throw new Error(response.error);
        }
        
        // Check for error in response data
        if (isListError(response.data)) {
          logger.error('useLists: Response contains error', response.data);
          throw new Error(response.data.message || response.data.error);
        }
        
        // Validate response format
        if (!isListsResponse(response.data)) {
          logger.warn('useLists: Unexpected response format', response.data);
          throw new Error('Invalid response format');
        }
        
        const data = response.data as ListsResponse;
        logger.info('useLists: Successfully processed data', { 
          listCount: data.lists.length,
          total: data.meta.total,
          userRole: data.meta.userRole
        });
        
        return data.lists;
        
      } catch (error) {
        logger.error('useLists: Query failed', { error: error instanceof Error ? error.message : error });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      logger.info('useLists: Retry attempt', { failureCount, error: error.message });
      // Don't retry on authentication errors
      if (error.message.includes('Unauthorized') || error.message.includes('Not authenticated')) {
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
    mutationFn: async (listData: CreateListRequest): Promise<ListWithRelations> => {
      logger.info('useCreateList: Creating list', { listData });
      
      const response = await api.post('/lists', listData);
      
      if (response.error) {
        logger.error('useCreateList: API error', { error: response.error });
        throw new Error(response.error);
      }
      
      if (isListError(response.data)) {
        logger.error('useCreateList: Response error', response.data);
        throw new Error(response.data.message || response.data.error);
      }
      
      logger.info('useCreateList: List created successfully', { listId: response.data.id });
      return response.data;
    },
    onSuccess: (newList) => {
      logger.info('useCreateList: Updating cache', { listId: newList.id });
      
      // Update all list queries in cache
      queryClient.setQueriesData(
        { queryKey: [LISTS_QUERY_KEY] }, 
        (old: ListWithRelations[] | undefined) => {
          if (!old) return [newList];
          return [newList, ...old];
        }
      );
    },
    onError: (error) => {
      logger.error('useCreateList: Mutation failed', { error });
      // Invalidate and refetch all list queries on error
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}

export function useUpdateList(listId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: UpdateListRequest): Promise<ListWithRelations> => {
      logger.info('useUpdateList: Updating list', { listId, updates });
      
      const response = await api.patch(`/lists/${listId}`, updates);
      
      if (response.error) {
        logger.error('useUpdateList: API error', { error: response.error });
        throw new Error(response.error);
      }
      
      if (isListError(response.data)) {
        logger.error('useUpdateList: Response error', response.data);
        throw new Error(response.data.message || response.data.error);
      }
      
      logger.info('useUpdateList: List updated successfully', { listId });
      return response.data;
    },
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [LISTS_QUERY_KEY] });
      const previousQueries: Record<string, any> = {};
      
      // Update all matching list queries
      queryClient.getQueriesData({ queryKey: [LISTS_QUERY_KEY] }).forEach(([queryKey, queryData]) => {
        if (Array.isArray(queryData)) {
          previousQueries[JSON.stringify(queryKey)] = queryData;
          
          const updated = queryData.map((list: ListWithRelations) => 
            list.id === listId ? { ...list, ...updates } : list
          );
          
          queryClient.setQueryData(queryKey, updated);
        }
      });
      
      return { previousQueries };
    },
    onError: (err, variables, context) => {
      logger.error('useUpdateList: Mutation failed, rolling back', { error: err });
      
      // Rollback optimistic updates
      if (context?.previousQueries) {
        Object.entries(context.previousQueries).forEach(([key, data]) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }
    },
    onSuccess: (updatedList) => {
      logger.info('useUpdateList: Mutation successful', { listId });
      
      // Update individual list cache if it exists
      queryClient.setQueryData([LIST_QUERY_KEY, listId], updatedList);
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LIST_QUERY_KEY, listId] });
    },
  });
}

export function useDeleteList(listId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (): Promise<void> => {
      logger.info('useDeleteList: Deleting list', { listId });
      
      const response = await api.delete(`/lists/${listId}`);
      
      if (response.error) {
        logger.error('useDeleteList: API error', { error: response.error });
        throw new Error(response.error);
      }
      
      if (isListError(response.data)) {
        logger.error('useDeleteList: Response error', response.data);
        throw new Error(response.data.message || response.data.error);
      }
      
      logger.info('useDeleteList: List deleted successfully', { listId });
    },
    onMutate: async () => {
      // Optimistic delete
      await queryClient.cancelQueries({ queryKey: [LISTS_QUERY_KEY] });
      const previousQueries: Record<string, any> = {};
      
      // Remove from all matching list queries
      queryClient.getQueriesData({ queryKey: [LISTS_QUERY_KEY] }).forEach(([queryKey, queryData]) => {
        if (Array.isArray(queryData)) {
          previousQueries[JSON.stringify(queryKey)] = queryData;
          
          const filtered = queryData.filter((list: ListWithRelations) => list.id !== listId);
          queryClient.setQueryData(queryKey, filtered);
        }
      });
      
      return { previousQueries };
    },
    onError: (err, variables, context) => {
      logger.error('useDeleteList: Mutation failed, rolling back', { error: err });
      
      // Rollback optimistic updates
      if (context?.previousQueries) {
        Object.entries(context.previousQueries).forEach(([key, data]) => {
          queryClient.setQueryData(JSON.parse(key), data);
        });
      }
    },
    onSuccess: () => {
      logger.info('useDeleteList: Mutation successful', { listId });
      
      // Remove individual list from cache
      queryClient.removeQueries({ queryKey: [LIST_QUERY_KEY, listId] });
    },
    onSettled: () => {
      // Invalidate to ensure consistency
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
    },
  });
}

// Hook for fetching individual list with details
export function useList(listId: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: [LIST_QUERY_KEY, listId],
    queryFn: async (): Promise<ListWithDetails> => {
      logger.info('useList: Fetching list', { listId });
      
      try {
        const response = await api.get(`/lists/${listId}`);
        
        if (response.error) {
          logger.error('useList: API error', { error: response.error });
          throw new Error(response.error);
        }
        
        if (isListError(response.data)) {
          logger.error('useList: Response error', response.data);
          throw new Error(response.data.message || response.data.error);
        }
        
        if (!isListWithDetails(response.data)) {
          logger.warn('useList: Unexpected response format', response.data);
          throw new Error('Invalid response format');
        }
        
        logger.info('useList: List fetched successfully', { listId });
        return response.data;
        
      } catch (error) {
        logger.error('useList: Query failed', { listId, error: error instanceof Error ? error.message : error });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!listId, // Only run if listId is provided
    retry: (failureCount, error) => {
      logger.info('useList: Retry attempt', { listId, failureCount, error: error.message });
      // Don't retry on authentication or not found errors
      if (error.message.includes('Unauthorized') || error.message.includes('not found')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Utility hook to get lists grouped by folder
export function useListsByFolder(options: ListQueryOptions = {}) {
  const { data: lists, ...query } = useLists(options);
  
  const groupedLists = React.useMemo(() => {
    if (!lists) return { withoutFolder: [], withFolder: {} };
    
    const withoutFolder: ListWithRelations[] = [];
    const withFolder: Record<string, { folder: { id: string; name: string; color: string | null }, lists: ListWithRelations[] }> = {};
    
    lists.forEach(list => {
      if (!list.folder) {
        withoutFolder.push(list);
      } else {
        const folderId = list.folder.id;
        if (!withFolder[folderId]) {
          withFolder[folderId] = {
            folder: list.folder,
            lists: []
          };
        }
        withFolder[folderId].lists.push(list);
      }
    });
    
    return { withoutFolder, withFolder };
  }, [lists]);
  
  return {
    ...query,
    data: lists,
    groupedLists
  };
}