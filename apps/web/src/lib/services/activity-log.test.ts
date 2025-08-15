import { ActivityLogService } from './activity-log';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    activityLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('ActivityLogService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('should create activity log entry', async () => {
      const logData = {
        familyId: 'family-123',
        userId: 'user-123',
        action: 'CREATE' as const,
        entityType: 'task' as const,
        entityId: 'task-123',
        entityName: 'Test Task',
        metadata: { priority: 'HIGH' },
      };

      const mockCreatedLog = {
        id: 'log-123',
        ...logData,
        created_at: new Date(),
        user: {
          id: 'user-123',
          displayName: 'Test User',
          email: 'test@example.com',
        },
      };

      mockPrisma.activityLog.create.mockResolvedValue(mockCreatedLog);

      const result = await ActivityLogService.log(logData);

      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: logData,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockCreatedLog);
    });

    it('should handle errors gracefully', async () => {
      const logData = {
        familyId: 'family-123',
        userId: 'user-123',
        action: 'CREATE' as const,
        entityType: 'task' as const,
      };

      mockPrisma.activityLog.create.mockRejectedValue(new Error('Database error'));

      const result = await ActivityLogService.log(logData);

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Failed to log activity:', expect.any(Error));
    });
  });

  describe('getForFamily', () => {
    it('should fetch activity logs for family', async () => {
      const familyId = 'family-123';
      const mockLogs = [
        {
          id: 'log-1',
          familyId,
          action: 'CREATE',
          entityType: 'task',
          created_at: new Date(),
          user: { id: 'user-1', displayName: 'User 1', email: 'user1@example.com' },
        },
        {
          id: 'log-2',
          familyId,
          action: 'UPDATE',
          entityType: 'list',
          created_at: new Date(),
          user: { id: 'user-2', displayName: 'User 2', email: 'user2@example.com' },
        },
      ];

      mockPrisma.activityLog.findMany.mockResolvedValue(mockLogs);

      const result = await ActivityLogService.getForFamily(familyId);

      expect(mockPrisma.activityLog.findMany).toHaveBeenCalledWith({
        where: { familyId },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 50,
        skip: 0,
      });

      expect(result).toEqual(mockLogs);
    });

    it('should apply filters correctly', async () => {
      const familyId = 'family-123';
      const options = {
        entityType: 'task' as const,
        entityId: 'task-123',
        userId: 'user-123',
        limit: 10,
        offset: 5,
      };

      mockPrisma.activityLog.findMany.mockResolvedValue([]);

      await ActivityLogService.getForFamily(familyId, options);

      expect(mockPrisma.activityLog.findMany).toHaveBeenCalledWith({
        where: {
          familyId,
          entityType: 'task',
          entityId: 'task-123',
          userId: 'user-123',
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 10,
        skip: 5,
      });
    });
  });

  describe('convenience methods', () => {
    it('should log task creation', async () => {
      const mockCreatedLog = {
        id: 'log-123',
        familyId: 'family-123',
        userId: 'user-123',
        action: 'CREATE',
        entityType: 'task',
        entityId: 'task-123',
        entityName: 'Test Task',
        created_at: new Date(),
        user: { id: 'user-123', displayName: 'Test User', email: 'test@example.com' },
      };

      mockPrisma.activityLog.create.mockResolvedValue(mockCreatedLog);

      const result = await ActivityLogService.logTaskCreated(
        'family-123',
        'user-123',
        'task-123',
        'Test Task',
        { priority: 'HIGH' }
      );

      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          familyId: 'family-123',
          userId: 'user-123',
          action: 'CREATE',
          entityType: 'task',
          entityId: 'task-123',
          entityName: 'Test Task',
          metadata: { priority: 'HIGH' },
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockCreatedLog);
    });

    it('should log task completion', async () => {
      const mockCreatedLog = {
        id: 'log-123',
        familyId: 'family-123',
        userId: 'user-123',
        action: 'COMPLETE',
        entityType: 'task',
        entityId: 'task-123',
        entityName: 'Test Task',
        created_at: new Date(),
        user: { id: 'user-123', displayName: 'Test User', email: 'test@example.com' },
      };

      mockPrisma.activityLog.create.mockResolvedValue(mockCreatedLog);

      const result = await ActivityLogService.logTaskCompleted(
        'family-123',
        'user-123',
        'task-123',
        'Test Task'
      );

      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          familyId: 'family-123',
          userId: 'user-123',
          action: 'COMPLETE',
          entityType: 'task',
          entityId: 'task-123',
          entityName: 'Test Task',
          metadata: undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
        },
      });

      expect(result).toEqual(mockCreatedLog);
    });
  });

  describe('cleanup', () => {
    it('should delete old activity logs', async () => {
      const daysToKeep = 30;
      const expectedCutoffDate = new Date();
      expectedCutoffDate.setDate(expectedCutoffDate.getDate() - daysToKeep);

      mockPrisma.activityLog.deleteMany.mockResolvedValue({ count: 150 });

      const result = await ActivityLogService.cleanup(daysToKeep);

      expect(mockPrisma.activityLog.deleteMany).toHaveBeenCalledWith({
        where: {
          created_at: { lt: expect.any(Date) },
        },
      });

      expect(result).toEqual({ count: 150 });
    });
  });
});