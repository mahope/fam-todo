// Shared types for Lists API

export interface ListItem {
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
  // Computed fields for frontend convenience
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface ListsApiResponse {
  success: true;
  lists: ListItem[];
  meta: {
    total: number;
    userRole: string;
    familyId: string;
  };
}

export interface ListsApiError {
  success: false;
  error: string;
  message: string;
}

// Union type for all possible API responses
export type ListsApiResult = ListsApiResponse | ListsApiError;

// Type guard to check if response is an error
export function isListsApiError(response: any): response is ListsApiError {
  return response && typeof response === 'object' && response.success === false;
}

// Type guard to check if response is successful
export function isListsApiSuccess(response: any): response is ListsApiResponse {
  return response && typeof response === 'object' && response.success === true && Array.isArray(response.lists);
}

// For backward compatibility with the old API format
export type LegacyListsApiResponse = ListItem[];

// Type guard to check if response is the old array format
export function isLegacyListsResponse(response: any): response is LegacyListsApiResponse {
  return Array.isArray(response);
}

// Combined type for handling both old and new API responses
export type ListsApiResponseUnion = ListsApiResult | LegacyListsApiResponse;