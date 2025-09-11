// Client-side hook for scanning and importing list items from images
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { LISTS_QUERY_KEY, LIST_QUERY_KEY } from './use-lists';
import { ParsedListItem } from '@/lib/services/ocr';

export interface ExtractRequest {
  image: string; // Base64 encoded image
  listType: 'TODO' | 'SHOPPING';
}

export interface ExtractResult {
  items: ParsedListItem[];
  confidence: number;
  lines: string[];
}

export interface ScanRequest {
  items: ParsedListItem[];
  mode?: 'append' | 'replace';
  autoCategories?: boolean;
}

export interface ScanResult {
  success: boolean;
  listId: string;
  listType: 'TODO' | 'SHOPPING';
  mode: 'append' | 'replace';
  created: number;
  items: any[];
}

// Hook for extracting OCR text without saving
export function useExtractOCR() {
  const api = useApi();

  return useMutation<ExtractResult, Error, ExtractRequest>({
    mutationFn: async (data: ExtractRequest) => {
      logger.info('useExtractOCR: Extracting text from image', { listType: data.listType });
      
      const response = await api.post('/ocr/extract', data);
      
      if (response.error) {
        logger.error('useExtractOCR: API error', { error: response.error });
        throw new Error(response.error);
      }
      
      if (!response.data?.items) {
        logger.error('useExtractOCR: Invalid response', response.data);
        throw new Error('Failed to extract text from image');
      }
      
      logger.info('useExtractOCR: Extraction successful', { 
        itemCount: response.data.items.length,
        confidence: response.data.confidence
      });
      
      return response.data;
    },
  });
}

// Hook for saving confirmed items to list
export function useScanListItems(listId: string) {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation<ScanResult, Error, ScanRequest>({
    mutationFn: async (data: ScanRequest) => {
      logger.info('useScanListItems: Adding items to list', { listId, mode: data.mode, itemCount: data.items.length });
      
      const response = await api.post(`/lists/${listId}/items/batch`, data);
      
      if (response.error) {
        logger.error('useScanListItems: API error', { error: response.error });
        throw new Error(response.error);
      }
      
      if (!response.data?.success) {
        logger.error('useScanListItems: Failed to add items', response.data);
        throw new Error(response.data?.message || 'Failed to add items to list');
      }
      
      logger.info('useScanListItems: Items added successfully', { 
        created: response.data.created
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