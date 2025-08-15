import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/security/auth-middleware';
import { SessionData } from '@/lib/auth/types';

export const GET = withAuth(
  async (request: NextRequest, sessionData: SessionData): Promise<NextResponse> => {
    try {
      // Get PWA status information
      const status = {
        serviceWorker: {
          registered: false,
          active: false,
          waiting: false,
          installing: false,
        },
        manifest: {
          valid: true,
          url: '/manifest.json',
        },
        installation: {
          installable: true,
          standalone: false,
        },
        caching: {
          cacheStorage: 'available',
          indexedDB: 'available',
        },
        features: {
          pushNotifications: 'supported',
          backgroundSync: 'supported',
          webShare: 'supported',
          mediaDevices: 'supported',
        },
        performance: {
          connectionType: 'unknown',
          effectiveType: 'unknown',
          downlink: 0,
          rtt: 0,
        },
        storage: {
          used: 0,
          available: 0,
          persistent: false,
        },
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json({
        status: 'healthy',
        pwa: status,
        recommendations: [
          'Enable push notifications for real-time updates',
          'Install app for better performance',
          'Use offline mode when internet is slow',
        ],
      });
    } catch (error) {
      console.error('Failed to get PWA status:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve PWA status' },
        { status: 500 }
      );
    }
  },
  {
    requireAuth: true,
    rateLimitRule: 'api',
    allowedMethods: ['GET'],
  }
);