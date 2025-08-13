import { useSession } from "@/lib/auth-client";

// Base URL for PostgREST API
const API_BASE_URL = process.env.NEXT_PUBLIC_POSTGREST_URL || "http://localhost:3001";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

interface RequestOptions extends RequestInit {
  searchParams?: Record<string, string | number | boolean>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    // This will be called from React context
    return null;
  }

  private async buildURL(endpoint: string, searchParams?: Record<string, any>): Promise<string> {
    const url = new URL(endpoint, this.baseURL);
    
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async buildHeaders(token?: string | null): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { searchParams, ...fetchOptions } = options;
      const url = await this.buildURL(endpoint, searchParams);
      const token = await this.getAuthToken();
      const headers = await this.buildHeaders(token);

      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...headers,
          ...fetchOptions.headers,
        },
      });

      let data: T;
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      if (!response.ok) {
        return {
          error: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        };
      }

      return { data, status: response.status };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 0,
      };
    }
  }

  async get<T = any>(endpoint: string, searchParams?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET", searchParams });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();

// Hook for authenticated API requests
export function useApi() {
  const { data: session } = useSession();
  const token = (session as any)?.postgrestToken;

  return {
    async get<T = any>(endpoint: string, searchParams?: Record<string, any>): Promise<ApiResponse<T>> {
      return apiClient.request<T>(endpoint, { 
        method: "GET", 
        searchParams,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    },
    async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
      return apiClient.request<T>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    },
    async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
      return apiClient.request<T>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    },
    async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
      return apiClient.request<T>(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    },
    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
      return apiClient.request<T>(endpoint, { 
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    },
    token,
  };
}

// Type definitions for our data models
export interface Family {
  id: string;
  name: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  auth_user_id: string;
  family_id: string;
  role: "admin" | "adult" | "child";
  email: string;
  display_name: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: string;
  family_id: string;
  owner_id?: string;
  folder_id?: string;
  name: string;
  description?: string;
  color?: string;
  visibility: "private" | "family" | "adults";
  type: "generic" | "shopping";
  sort_index: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  list_id: string;
  family_id: string;
  owner_id?: string;
  assigned_user_id?: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "done" | "archived";
  priority: "none" | "low" | "medium" | "high";
  due_at?: string;
  completed_at?: string;
  is_recurring: boolean;
  sort_index: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  family_id: string;
  owner_id?: string;
  name: string;
  color?: string;
  visibility: "private" | "family" | "adults";
  parent_id?: string;
  sort_index: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShoppingItem {
  id: string;
  list_id: string;
  family_id: string;
  name: string;
  normalized_name?: string;
  quantity?: number;
  unit?: string;
  category: string;
  is_purchased: boolean;
  last_purchased_at?: string;
  suggestion_hits: number;
  sort_index: number;
  created_at: string;
  updated_at: string;
}