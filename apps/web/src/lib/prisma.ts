import { PrismaClient } from '@prisma/client';
import { env } from './env-validation';
import { logger } from './logger';

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
        // Add connection pool parameters in production for better stability
        url: env.NODE_ENV === 'production'
          ? `${env.DATABASE_URL}?connection_limit=5&pool_timeout=10&connect_timeout=10`
          : env.DATABASE_URL,
      },
    },
  });

// Graceful shutdown
if (env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    logger.info('Disconnecting from database...');
    await prisma.$disconnect();
  });
}

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}