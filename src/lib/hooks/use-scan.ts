// Client-side hook for scanning and importing list items from images
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { LISTS_QUERY_KEY, LIST_QUERY_KEY } from './use-lists';

export interface ScanRequest {
  image: string; // Base64 encoded image
  mode?: 'append' | 'replace';
  autoCategories?: boolean;
}

export interface ScanResult {
  success: boolean;
  listId: string;
  listType: 'TODO' | 'SHOPPING';
  mode: 'append' | 'replace';
  extracted: number;
  created: number;
  items: any[];
  confidence: number;
}

export function useScanListItems(listId: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation<ScanResult, Error, ScanRequest>({
    mutationFn: async (data: ScanRequest) => {
      logger.info('useScanListItems: Scanning image', { listId, mode: data.mode });
      
      const response = await api.post(`/lists/${listId}/scan`, data);
      
      if (response.error) {
        logger.error('useScanListItems: API error', { error: response.error });
        throw new Error(response.error);
      }
      
      if (!response.data?.success) {
        logger.error('useScanListItems: Scan failed', response.data);
        throw new Error(response.data?.message || 'Failed to scan image');
      }
      
      logger.info('useScanListItems: Scan successful', { 
        extracted: response.data.extracted,
        created: response.data.created,
        confidence: response.data.confidence
      });
      
      return response.data;
    },
    onSuccess: (result) => {
      logger.info('useScanListItems: Updating cache', { listId });
      
      // Invalidate list queries to refresh the data
      queryClient.invalidateQueries({ queryKey: [LISTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [LIST_QUERY_KEY, listId] });
      
      // Also invalidate tasks or shopping items queries if they exist
      if (result.listType === 'TODO') {
        queryClient.invalidateQueries({ queryKey: ['tasks', listId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['shopping-items', listId] });
      }
    },
    onError: (error) => {
      logger.error('useScanListItems: Mutation failed', { error });
    },
  });
}