import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma configuration for production stability
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pool configuration for production
    ...(process.env.NODE_ENV === 'production' && {
      datasources: {
        db: {
          url: `${process.env.DATABASE_URL}?connection_limit=5&pool_timeout=10&connect_timeout=10`,
        },
      },
    }),
  });

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    console.log('Disconnecting from database...');
    await prisma.$disconnect();
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}