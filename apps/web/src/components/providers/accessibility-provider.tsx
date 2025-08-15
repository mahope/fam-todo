'use client';

import { useEffect } from 'react';
import { initializeAccessibility } from '@/lib/accessibility';

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize accessibility features on client side
    const cleanup = initializeAccessibility();

    // Cleanup on unmount
    return cleanup;
  }, []);

  return <>{children}</>;
}