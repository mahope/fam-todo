
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { ClientOnly } from "@/components/client-only";
import { initializeMonitoring } from '@/lib/monitoring';
import { SkipLinks, KeyboardHints, RouteAnnouncer } from '@/lib/accessibility';

// Initialize monitoring on app start (server-side only)
if (typeof window === 'undefined') {
  initializeMonitoring();
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FamTodo",
  description: "Familie Opgave Håndtering",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load messages and locale for the current user
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <SkipLinks />
        <KeyboardHints />
        <RouteAnnouncer />
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ClientOnly fallback={<div className="h-14 border-b bg-background"></div>}>
              <Header />
            </ClientOnly>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
