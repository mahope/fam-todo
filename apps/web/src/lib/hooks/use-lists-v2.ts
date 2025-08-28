'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { logger } from '@/lib/logger';

// Query key for lists
export const LISTS_V2_QUERY_KEY = 'lists-v2';

// Types for the new API response
export interface ListV2 {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  visibility: 'PRIVATE' | 'FAMILY' | 'ADULT';
  type: string | null;
  ownerId: string;
  familyId: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
  };
  folder: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  taskCount: number;
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ListsV2Response {
  success: boolean;
  lists: ListV2[];
  meta: {
    total: number;
    userRole: string;
    familyId: string;
  };
}

export interface ListsV2Error {
  success: false;
  error: string;
  message: string;
}

// Hook to fetch lists using the new API
export function useListsV2() {
  const api = useApi();

  return useQuery({
    queryKey: [LISTS_V2_QUERY_KEY],
    queryFn: async (): Promise<ListsV2Response> => {
      try {
        logger.info('useListsV2: Fetching lists from /api/lists-v2');
        
        const response = await api.get('/lists-v2');
        
        // Check if we got redirected to login (HTML response)
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          logger.error('useListsV2: Received HTML instead of JSON - authentication failed');
          throw new Error('Authentication failed - please login again');
        }

        // Type guard to ensure we have the right response structure
        if (!response.data || typeof response.data !== 'object') {
          logger.error('useListsV2: Invalid response format', response.data);
          throw new Error('Invalid response format from server');
        }

        const data = response.data as ListsV2Response | ListsV2Error;

        if (!data.success) {
          const error = data as ListsV2Error;
          logger.error('useListsV2: API returned error', error);
          throw new Error(error.message || error.error || 'Failed to fetch lists');
        }

        const listsResponse = data as ListsV2Response;
        logger.info('useListsV2: Successfully fetched lists', { 
          count: listsResponse.lists.length,
          userRole: listsResponse.meta.userRole 
        });

        return listsResponse;

      } catch (error) {
        logger.error('useListsV2: Request failed', error as any);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache for 30 minutes
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      if (error instanceof Error && error.message.includes('Authentication failed')) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: true, // Do refetch when component mounts
  });
}

// Hook to delete a list
export function useDeleteListV2() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      logger.info('useDeleteListV2: Deleting list', { listId });
      
      const response = await api.delete(`/lists/${listId}`);
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to delete list');
      }
      
      return response.data;
    },
    onSuccess: (data, listId) => {
      logger.info('useDeleteListV2: List deleted successfully', { listId });
      
      // Update the cache by removing the deleted list
      queryClient.setQueryData([LISTS_V2_QUERY_KEY], (old: ListsV2Response | undefined) => {
        if (!old) return old;
        
        return {
          ...old,
          lists: old.lists.filter(list => list.id !== listId),
          meta: {
            ...old.meta,
            total: old.meta.total - 1
          }
        };
      });

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: [LISTS_V2_QUERY_KEY] });
    },
    onError: (error, listId) => {
      logger.error('useDeleteListV2: Failed to delete list', { listId, error: error as any });
    }
  });
}

// Hook to create a new list
export function useCreateListV2() {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listData: {
      name: string;
      description?: string;
      color?: string;
      visibility: 'PRIVATE' | 'FAMILY' | 'ADULT';
      type?: string;
      folderId?: string;
    }) => {
      logger.info('useCreateListV2: Creating new list', listData);
      
      const response = await api.post('/lists', listData);
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || 'Failed to create list');
      }
      
      return response.data;
    },
    onSuccess: (newList) => {
      logger.info('useCreateListV2: List created successfully', { listId: newList.id });
      
      // Invalidate and refetch lists
      queryClient.invalidateQueries({ queryKey: [LISTS_V2_QUERY_KEY] });
    },
    onError: (error) => {
      logger.error('useCreateListV2: Failed to create list', { error: error as any });
    }
  });
}