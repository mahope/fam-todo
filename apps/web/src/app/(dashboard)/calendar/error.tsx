'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    logger.error('Calendar page error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack
    })
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Kalender fejl
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Der opstod en fejl i kalenderen. Prøv at genindlæse eller gå til en anden side.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-mono">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 justify-center">
          <Button onClick={reset}>
            Prøv igen
          </Button>
          <Button asChild variant="outline">
            <Link href="/tasks">
              Gå til opgaver
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
