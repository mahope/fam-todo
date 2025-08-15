import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

export interface Folder {
  id: string;
  name: string;
  color?: string;
  familyId: string;
  ownerId: string;
  visibility: 'PRIVATE' | 'FAMILY' | 'ADULT';
  created_at: string;
  updated_at: string;
  owner: {
    id: string;
    displayName?: string;
  };
  lists?: any[];
  _count: {
    lists: number;
  };
}

export const FOLDERS_QUERY_KEY = 'folders';

export function useFolders() {
  const api = useApi();
  
  return useQuery({
    queryKey: [FOLDERS_QUERY_KEY],
    queryFn: async () => {
      const response = await api.get('/folders');
      
      // Check if we got HTML instead of JSON (indicates redirect to login)
      if (response.data && typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
        throw new Error('Not authenticated - redirected to HTML page');
      }
      
      // Check if the response itself is an error object
      if (response.error || (response.data && typeof response.data === 'object' && 'error' in response.data)) {
        const errorMsg = response.error || response.data?.error || 'Unknown error';
        throw new Error(errorMsg);
      }
      
      // Ensure we always return an array
      const data = response.data;
      return Array.isArray(data) ? data as Folder[] : [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
  });
}

export function useFolder(folderId: string) {
  const api = useApi();
  
  return useQuery({
    queryKey: [FOLDERS_QUERY_KEY, folderId],
    queryFn: async () => {
      const response = await api.get(`/folders/${folderId}`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data as Folder;
    },
    enabled: !!folderId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateFolder() {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (folderData: {
      name: string;
      color?: string;
      visibility?: 'PRIVATE' | 'FAMILY' | 'ADULT';
    }) => {
      const response = await api.post('/folders', folderData);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (newFolder) => {
      // Optimistically update the cache
      queryClient.setQueryData([FOLDERS_QUERY_KEY], (old: Folder[] | undefined) => {
        if (!old) return [newFolder];
        return [newFolder, ...old];
      });
      
      // Invalidate lists since folder structure might affect list display
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
    onError: () => {
      // Invalidate and refetch on error
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] });
    },
  });
}

export function useUpdateFolder(folderId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<Folder>) => {
      const response = await api.patch(`/folders/${folderId}`, updates);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: [FOLDERS_QUERY_KEY] });
      const previous = queryClient.getQueryData([FOLDERS_QUERY_KEY]);
      
      queryClient.setQueryData([FOLDERS_QUERY_KEY], (old: Folder[] | undefined) => {
        if (!old) return old;
        return old.map(folder => 
          folder.id === folderId ? { ...folder, ...updates } : folder
        );
      });
      
      // Also update individual folder cache
      queryClient.setQueryData([FOLDERS_QUERY_KEY, folderId], (old: Folder | undefined) => {
        if (!old) return old;
        return { ...old, ...updates };
      });
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData([FOLDERS_QUERY_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] });
    },
  });
}

export function useDeleteFolder(folderId: string) {
  const api = useApi();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/folders/${folderId}`);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onMutate: async () => {
      // Optimistic delete
      await queryClient.cancelQueries({ queryKey: [FOLDERS_QUERY_KEY] });
      const previous = queryClient.getQueryData([FOLDERS_QUERY_KEY]);
      
      queryClient.setQueryData([FOLDERS_QUERY_KEY], (old: Folder[] | undefined) => {
        if (!old) return old;
        return old.filter(folder => folder.id !== folderId);
      });
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData([FOLDERS_QUERY_KEY], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['lists'] });
    },
  });
}