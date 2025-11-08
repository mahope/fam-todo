"use client";

import { useEffect } from "react";

/**
 * Component to unregister old service workers
 * This is needed when we disable service workers in config
 * but old ones are still registered in browsers
 */
export function UnregisterServiceWorker() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) {
              console.log('Service Worker unregistered successfully');
            }
          });
        }
      });
    }
  }, []);

  return null;
}
