import '@testing-library/jest-dom'

// Mock Prisma
jest.mock('@prisma/client')

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'

// Mock fetch
global.fetch = jest.fn()

// Mock performance APIs
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
})

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(() => Promise.resolve({
    createObjectStore: jest.fn(),
    transaction: jest.fn(() => ({
      objectStore: jest.fn(() => ({
        add: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve()),
        getAll: jest.fn(() => Promise.resolve([])),
        delete: jest.fn(() => Promise.resolve()),
      })),
    })),
  })),
}

Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
})

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))