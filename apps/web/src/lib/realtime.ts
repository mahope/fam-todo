import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { io, Socket } from 'socket.io-client';
import { createJwtFromSession } from '@/lib/auth/jwt';

export interface RealtimeEvent {
  type: 'list_created' | 'list_updated' | 'list_deleted' |
        'task_created' | 'task_updated' | 'task_deleted' | 'task_completed' |
        'folder_created' | 'folder_updated' | 'folder_deleted' |
        'shopping_item_created' | 'shopping_item_updated' | 'shopping_item_deleted' |
        'user_joined' | 'user_left' | 'notification_created';
  data: any;
  familyId: string;
  userId?: string;
  timestamp: string;
}

export interface UserPresenceEvent {
  type: 'user_joined' | 'user_left' | 'presence_update';
  userId: string;
  data?: any;
  timestamp: string;
}

class RealtimeClient {
  private socket: Socket | null = null;
  private isConnecting = false;
  private callbacks = new Map<string, Set<(event: RealtimeEvent) => void>>();
  private presenceCallbacks = new Set<(event: UserPresenceEvent) => void>();

  async connect(token: string) {
    if (this.socket?.connected || this.isConnecting) return;

    this.isConnecting = true;

    try {
      this.socket = io(process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL! 
        : 'http://localhost:3000', {
        path: '/api/socket',
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to real-time server');
        this.isConnecting = false;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from real-time server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnecting = false;
      });

      this.socket.on('realtime_update', (event: RealtimeEvent) => {
        this.handleRealtimeEvent(event);
      });

      this.socket.on('user_presence', (event: UserPresenceEvent) => {
        this.presenceCallbacks.forEach(callback => callback(event));
      });

      this.socket.on('notification', (notification: any) => {
        // Handle real-time notifications
        console.log('Real-time notification:', notification);
      });

    } catch (error) {
      console.error('Failed to connect to real-time server:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.callbacks.clear();
    this.presenceCallbacks.clear();
  }

  subscribe(eventType: string, callback: (event: RealtimeEvent) => void) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, new Set());
    }
    this.callbacks.get(eventType)!.add(callback);

    return () => {
      const callbacks = this.callbacks.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.callbacks.delete(eventType);
        }
      }
    };
  }

  subscribeToPresence(callback: (event: UserPresenceEvent) => void) {
    this.presenceCallbacks.add(callback);

    return () => {
      this.presenceCallbacks.delete(callback);
    };
  }

  private handleRealtimeEvent(event: RealtimeEvent) {
    console.log('Real-time event received:', event);

    // Call type-specific callbacks
    const callbacks = this.callbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(event));
    }

    // Call general callbacks
    const generalCallbacks = this.callbacks.get('*');
    if (generalCallbacks) {
      generalCallbacks.forEach(callback => callback(event));
    }
  }

  emitPresence(data: any) {
    if (this.socket?.connected) {
      this.socket.emit('update_presence', data);
    }
  }

  emitTaskEditing(taskId: string, isEditing: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('task_editing', { taskId, isEditing });
    }
  }

  emitListEditing(listId: string, isEditing: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('list_editing', { listId, isEditing });
    }
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

const realtimeClient = new RealtimeClient();

export function useRealtime() {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (session && !initRef.current) {
      initRef.current = true;
      
      createJwtFromSession(session).then(token => {
        if (token) {
          realtimeClient.connect(token);
        }
      });
    }

    const checkConnection = () => {
      setIsConnected(realtimeClient.isConnected);
    };

    const interval = setInterval(checkConnection, 1000);
    checkConnection();

    return () => {
      clearInterval(interval);
    };
  }, [session]);

  useEffect(() => {
    return () => {
      if (initRef.current) {
        realtimeClient.disconnect();
        initRef.current = false;
      }
    };
  }, []);

  const subscribe = (eventType: string, callback: (event: RealtimeEvent) => void) => {
    return realtimeClient.subscribe(eventType, callback);
  };

  const subscribeToPresence = (callback: (event: UserPresenceEvent) => void) => {
    return realtimeClient.subscribeToPresence(callback);
  };

  return {
    isConnected,
    subscribe,
    subscribeToPresence,
    emitPresence: realtimeClient.emitPresence.bind(realtimeClient),
    emitTaskEditing: realtimeClient.emitTaskEditing.bind(realtimeClient),
    emitListEditing: realtimeClient.emitListEditing.bind(realtimeClient),
  };
}

export function useRealtimeSubscription(
  eventType: string,
  callback?: (event: RealtimeEvent) => void,
  enabled: boolean = true
) {
  const { isConnected, subscribe } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !isConnected) return;

    const unsubscribe = subscribe(eventType, (event) => {
      callback?.(event);
      
      // Auto-invalidate related queries
      if (event.type.includes('list')) {
        queryClient.invalidateQueries({ queryKey: ['lists'] });
      }
      if (event.type.includes('task')) {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
      }
      if (event.type.includes('folder')) {
        queryClient.invalidateQueries({ queryKey: ['folders'] });
      }
    });

    return unsubscribe;
  }, [eventType, callback, enabled, isConnected, subscribe, queryClient]);

  return { isConnected };
}

export { realtimeClient };