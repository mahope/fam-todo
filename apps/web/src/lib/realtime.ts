// Simplified realtime implementation without Supabase
// TODO: Implement real-time updates using WebSockets or Server-Sent Events when needed

import { useQueryClient } from "@tanstack/react-query";

export interface RealtimeEvent {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  data: Record<string, any>;
}

// Stub implementation - no actual real-time functionality
export function useRealtime() {
  const queryClient = useQueryClient();
  
  const subscribe = (table: string, callback?: (event: RealtimeEvent) => void) => {
    // For now, return null - no actual subscription
    console.log(`Realtime subscription requested for table: ${table} (not implemented)`);
    return null;
  };

  const unsubscribe = (table: string) => {
    console.log(`Realtime unsubscription requested for table: ${table} (not implemented)`);
  };

  return {
    isConnected: false, // No real-time connection in simplified architecture
    subscribe,
    unsubscribe,
  };
}

// Stub implementation for compatibility
export function useRealtimeSubscription(
  table: string,
  callback?: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  return { isConnected: false };
}