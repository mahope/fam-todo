'use client';

import { useEffect } from 'react';
import { initializePWA } from '@/lib/pwa';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PWA features on client side
    initializePWA();
  }, []);

  return <>{children}</>;
}