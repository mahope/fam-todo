import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

export interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  subscription: PushSubscription | null;
  permission: NotificationPermission;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: false,
    subscription: null,
    permission: 'default',
  });

  const queryClient = useQueryClient();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setState(prev => ({
        ...prev,
        isSupported,
        permission: isSupported ? Notification.permission : 'denied',
      }));
    };

    checkSupport();
  }, []);

  // Get VAPID public key
  const { data: vapidKey } = useQuery({
    queryKey: ['vapid-key'],
    queryFn: async () => {
      const response = await fetch('/api/push/vapid');
      if (!response.ok) throw new Error('Failed to fetch VAPID key');
      const data = await response.json();
      return data.publicKey;
    },
    enabled: state.isSupported,
  });

  // Check current subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!state.isSupported || !navigator.serviceWorker) return;

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState(prev => ({
          ...prev,
          isSubscribed: !!subscription,
          subscription,
        }));
      } catch (error) {
        logger.error('Failed to check push notification subscription', { error });
      }
    };

    if (state.isSupported) {
      checkSubscription();
    }
  }, [state.isSupported]);

  // Subscribe to push notifications
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!state.isSupported || !vapidKey) {
        throw new Error('Push notifications not supported or VAPID key missing');
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push manager
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      return subscription;
    },
    onSuccess: (subscription) => {
      setState(prev => ({
        ...prev,
        isSubscribed: true,
        subscription,
        permission: 'granted',
      }));
      queryClient.invalidateQueries({ queryKey: ['push-subscription'] });
    },
    onError: (error) => {
      logger.error('Push notification subscription failed', { error });
      setState(prev => ({
        ...prev,
        permission: Notification.permission,
      }));
    },
  });

  // Unsubscribe from push notifications
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      if (!state.subscription) {
        throw new Error('No active subscription');
      }

      // Unsubscribe from push manager
      await state.subscription.unsubscribe();

      // Remove subscription from server
      const response = await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: state.subscription.endpoint }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription');
      }
    },
    onSuccess: () => {
      setState(prev => ({
        ...prev,
        isSubscribed: false,
        subscription: null,
      }));
      queryClient.invalidateQueries({ queryKey: ['push-subscription'] });
    },
    onError: (error) => {
      logger.error('Push notification unsubscribe failed', { error });
    },
  });

  // Test notification
  const sendTestNotification = useCallback(async () => {
    if (!state.isSubscribed || state.permission !== 'granted') {
      throw new Error('Not subscribed or permission not granted');
    }

    // Send a local test notification
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification('FamTodo Test', {
        body: 'Dette er en test notifikation fra FamTodo',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'test-notification',
        data: { type: 'test' },
      });
    }
  }, [state.isSubscribed, state.permission]);

  const subscribe = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    subscribeMutation.mutate();
  }, [subscribeMutation]);

  const unsubscribe = useCallback(() => {
    setState(prev => ({ ...prev, isLoading: true }));
    unsubscribeMutation.mutate();
  }, [unsubscribeMutation]);

  // Update loading state
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: subscribeMutation.isPending || unsubscribeMutation.isPending,
    }));
  }, [subscribeMutation.isPending, unsubscribeMutation.isPending]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
    error: subscribeMutation.error || unsubscribeMutation.error,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}