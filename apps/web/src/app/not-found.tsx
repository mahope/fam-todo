import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Siden blev ikke fundet
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Den side du leder efter findes ikke eller er blevet flyttet.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">
              Gå til dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              Gå til forsiden
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}