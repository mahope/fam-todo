"use client";

import * as React from "react";
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - longer caching
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep in memory longer
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Enable background refetch for better UX
      refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
      refetchOnMount: false, // Use cached data if available
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      // Optimistic updates for better perceived performance
      onMutate: () => {
        // Will be overridden by individual mutations
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </NextThemesProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}