import { PrismaClient } from '@prisma/client';
import { env } from './env-validation';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma configuration for production stability
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: env.DATABASE_URL,
      },
    },
    // Connection pool configuration for production
    ...(env.NODE_ENV === 'production' && {
      datasources: {
        db: {
          url: `${env.DATABASE_URL}?connection_limit=5&pool_timeout=10&connect_timeout=10`,
        },
      },
    }),
  });

// Graceful shutdown
if (env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
  });
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}