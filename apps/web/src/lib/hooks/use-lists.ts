import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import type { List } from '@/lib/api';

export const LISTS_QUERY_KEY = 'lists';

export function useLists() {
  const api = useApi();
  
  return useQuery({
    queryKey: [LISTS_QUERY_KEY],
    queryFn: async () => {
      const response = await api.get('/lists');
      if (response.error) {
        throw new Error(response.error);
      }
      // Ensure we always return an array
      const data = response.data;
      return Array.isArray(data) ? data as List[] : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    // Enable background refetch for data freshness
    refetchOnWindowFocus: true,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds when focused
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