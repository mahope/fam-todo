
import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { ClientOnly } from "@/components/client-only";
import { logger } from '@/lib/logger';
import { SkipLinks, KeyboardHints, RouteAnnouncer } from '@/components/accessibility/skip-links';
import DiagnosticsPanel from '@/components/debug/DiagnosticsPanel';

// Initialize logging on app start (server-side only)
if (typeof window === 'undefined') {
  logger.info('Application starting', {
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "NestList - Den Komplette Familieorganisator | Opgaver, Lister & Samarbejde",
    template: "%s | NestList"
  },
  description: "Hold din familie organiseret med NestList. Smart opgavestyring, indkøbslister og koordinering for hele familien. Gratis, nemt og sikkert. Synkronisering i realtid og offline support.",
  keywords: [
    "familie opgaver",
    "familie organisering",
    "opgavestyring familie",
    "indkøbsliste app",
    "familie kalender",
    "delt opgaveliste",
    "familie samarbejde",
    "task manager familie",
    "husstandsplanlægning",
    "familie koordinering",
    "gratis opgave app",
    "dansk familie app"
  ],
  authors: [{ name: "NestList" }],
  creator: "NestList",
  publisher: "NestList",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: "/",
    title: "NestList - Den Komplette Familieorganisator",
    description: "Hold din familie organiseret med NestList. Smart opgavestyring, indkøbslister og koordinering for hele familien.",
    siteName: "NestList",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NestList - Familieorganisator"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "NestList - Den Komplette Familieorganisator",
    description: "Hold din familie organiseret med NestList. Gratis, nemt og sikkert.",
    images: ["/og-image.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
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
            <ClientOnly fallback={null}>
              <DiagnosticsPanel />
            </ClientOnly>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
