'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
            padding: '2rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <AlertTriangle style={{ 
              width: '48px', 
              height: '48px', 
              margin: '0 auto 1rem',
              color: '#ef4444'
            }} />
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
              Der opstod en fejl
            </h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Noget gik galt. Prøv venligst at genindlæse siden.
            </p>
            <Button onClick={reset} style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Prøv igen
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}