import { RealtimeClient } from "@supabase/realtime-js";
import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "ws://localhost:4000/socket";

let realtimeClient: RealtimeClient | null = null;

export interface RealtimeEvent {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, any>;
  old: Record<string, any>;
  errors?: any;
}

function getRealtimeClient(token?: string): RealtimeClient {
  if (!realtimeClient || (token && (realtimeClient as any).accessToken !== token)) {
    // Close existing connection
    if (realtimeClient) {
      realtimeClient.disconnect();
    }

    realtimeClient = new RealtimeClient(REALTIME_URL, {
      params: token ? { apikey: token } : undefined,
    });
  }
  return realtimeClient;
}

export function useRealtime() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<Map<string, any>>(new Map());

  const token = (session as any)?.postgrestToken;

  useEffect(() => {
    if (!token) {
      return;
    }

    const client = getRealtimeClient(token);
    
    // Connection event handlers
    const handleOpen = () => {
      console.log("Realtime connected");
      setIsConnected(true);
    };

    const handleClose = () => {
      console.log("Realtime disconnected");
      setIsConnected(false);
    };

    const handleError = (error: any) => {
      console.error("Realtime error:", error);
      setIsConnected(false);
    };

    (client as any).onOpen(handleOpen);
    (client as any).onClose(handleClose);
    (client as any).onError(handleError);

    // Connect
    client.connect();

    return () => {
      // Clean up subscriptions
      subscriptionsRef.current.forEach((subscription) => {
        subscription.unsubscribe();
      });
      subscriptionsRef.current.clear();

      if (realtimeClient) {
        realtimeClient.disconnect();
        realtimeClient = null;
      }
    };
  }, [token]);

  const subscribe = (table: string, callback?: (event: RealtimeEvent) => void) => {
    if (!token || !realtimeClient) {
      console.warn("Cannot subscribe: no token or client");
      return null;
    }

    const subscriptionKey = `${table}`;
    
    // Remove existing subscription for this table
    const existingSubscription = subscriptionsRef.current.get(subscriptionKey);
    if (existingSubscription) {
      existingSubscription.unsubscribe();
    }

    // Create new subscription
    const subscription = realtimeClient
      .channel("public", { 
        config: { 
          broadcast: { self: true },
          presence: { key: "" }
        }
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        (payload) => {
          console.log("Realtime event:", payload);
          
          // Invalidate related queries
          queryClient.invalidateQueries({ queryKey: [table] });
          queryClient.invalidateQueries({ queryKey: ["lists"] });
          queryClient.invalidateQueries({ queryKey: ["list-tasks"] });
          queryClient.invalidateQueries({ queryKey: ["shopping-items"] });

          // Call custom callback if provided
          if (callback) {
            callback(payload as RealtimeEvent);
          }
        }
      )
      .subscribe();

    subscriptionsRef.current.set(subscriptionKey, subscription);
    return subscription;
  };

  const unsubscribe = (table: string) => {
    const subscriptionKey = `${table}`;
    const subscription = subscriptionsRef.current.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      subscriptionsRef.current.delete(subscriptionKey);
    }
  };

  return {
    isConnected,
    subscribe,
    unsubscribe,
  };
}

// Hook for specific table subscriptions
export function useRealtimeSubscription(
  table: string,
  callback?: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  const { subscribe, unsubscribe, isConnected } = useRealtime();

  useEffect(() => {
    if (!enabled) return;

    const subscription = subscribe(table, callback);

    return () => {
      if (subscription) {
        unsubscribe(table);
      }
    };
  }, [table, enabled, subscribe, unsubscribe, callback]);

  return { isConnected };
}