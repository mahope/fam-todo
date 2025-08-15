"use client";

import * as React from "react";
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, backgroundCacheWarming } from "@/lib/performance/cache";
import { initPerformanceMonitoring } from "@/lib/performance/monitoring";
import { PWAProvider } from "./providers/pwa-provider";
import { AccessibilityProvider } from "./providers/accessibility-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialize performance monitoring on mount
  React.useEffect(() => {
    initPerformanceMonitoring();
    backgroundCacheWarming.onAppStart();
  }, []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWAProvider>
            <AccessibilityProvider>
              {children}
            </AccessibilityProvider>
          </PWAProvider>
        </NextThemesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}