// Unified types for List operations
// This replaces the old scattered list type definitions

export type ListVisibility = 'PRIVATE' | 'FAMILY' | 'ADULT';
export type ListType = 'TODO' | 'SHOPPING';

// Core List interface - matches database schema exactly
export interface List {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  familyId: string;
  ownerId: string;
  folderId: string | null;
  visibility: ListVisibility;
  listType: ListType;
  created_at: Date;
  updated_at: Date;
}

// List with computed relations for frontend
export interface ListWithRelations extends List {
  owner: {
    id: string;
    displayName: string | null;
    email: string;
  };
  folder: {
    id: string;
    name: string;
    color: string | null;
  } | null;
  taskCount: number;
  shoppingItemCount: number;
  // Computed permission fields
  isOwner: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// List with full details (tasks, shopping items)
export interface ListWithDetails extends ListWithRelations {
  tasks: Array<{
    id: string;
    title: string;
    completed: boolean;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    deadline: Date | null;
    assigneeId: string | null;
  }>;
  shoppingItems: Array<{
    id: string;
    name: string;
    purchased: boolean;
    quantity: number | null;
    unit: string | null;
  }>;
}

// API Request/Response types
export interface CreateListRequest {
  name: string;
  description?: string | null;
  color?: string | null;
  folderId?: string | null;
  visibility?: ListVisibility;
  listType?: ListType;
}

export interface UpdateListRequest {
  name?: string;
  description?: string | null;
  color?: string | null;
  folderId?: string | null;
  visibility?: ListVisibility;
}

export interface ListsResponse {
  lists: ListWithRelations[];
  meta: {
    total: number;
    userRole: string;
    familyId: string;
  };
}

// Error response
export interface ListError {
  error: string;
  message?: string;
  field?: string;
}

// API result types
export type ListsApiResult = ListsResponse | ListError;
export type ListApiResult = ListWithDetails | ListError;

// Type guards
export function isListError(response: any): response is ListError {
  return response && typeof response === 'object' && 'error' in response;
}

export function isListsResponse(response: any): response is ListsResponse {
  return response && typeof response === 'object' && 'lists' in response && Array.isArray(response.lists);
}

export function isListWithDetails(response: any): response is ListWithDetails {
  return response && typeof response === 'object' && 'id' in response && 'tasks' in response;
}

// Database query options
export interface ListQueryOptions {
  includeArchived?: boolean;
  listType?: ListType;
  folderId?: string | null;
  visibility?: ListVisibility;
  search?: string;
  orderBy?: 'name' | 'created_at' | 'updated_at';
  orderDirection?: 'asc' | 'desc';
}

// Permissions context
export interface ListPermissions {
  userId: string;
  familyId: string;
  role: 'ADMIN' | 'ADULT' | 'CHILD';
}