import { NotificationService } from './notifications';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create notification', async () => {
      const notificationData = {
        familyId: 'family-123',
        userId: 'user-123',
        type: 'TASK_ASSIGNED',
        title: 'New task assigned',
        message: 'You have been assigned a new task',
        entityType: 'task',
        entityId: 'task-123',
      };

      const mockCreatedNotification = {
        id: 'notification-123',
        ...notificationData,
        read: false,
        sendAt: new Date(),
        created_at: new Date(),
      };

      mockPrisma.notification.create.mockResolvedValue(mockCreatedNotification);

      const result = await NotificationService.create(notificationData);

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: notificationData,
      });

      expect(result).toEqual(mockCreatedNotification);
    });
  });

  describe('getForUser', () => {
    it('should fetch notifications for user', async () => {
      const userId = 'user-123';
      const mockNotifications = [
        {
          id: 'notification-1',
          userId,
          type: 'TASK_ASSIGNED',
          title: 'Task assigned',
          message: 'You have a new task',
          read: false,
          created_at: new Date(),
        },
        {
          id: 'notification-2',
          userId,
          type: 'DEADLINE_REMINDER',
          title: 'Deadline reminder',
          message: 'Task deadline is approaching',
          read: true,
          created_at: new Date(),
        },
      ];

      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);

      const result = await NotificationService.getForUser(userId);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { created_at: 'desc' },
        take: 50,
        skip: 0,
      });

      expect(result).toEqual(mockNotifications);
    });

    it('should apply pagination correctly', async () => {
      const userId = 'user-123';
      const options = { limit: 10, offset: 5 };

      mockPrisma.notification.findMany.mockResolvedValue([]);

      await NotificationService.getForUser(userId, options);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { created_at: 'desc' },
        take: 10,
        skip: 5,
      });
    });

    it('should filter unread notifications', async () => {
      const userId = 'user-123';
      const options = { unreadOnly: true };

      mockPrisma.notification.findMany.mockResolvedValue([]);

      await NotificationService.getForUser(userId, options);

      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId, read: false },
        orderBy: { created_at: 'desc' },
        take: 50,
        skip: 0,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notification-123';
      const mockUpdatedNotification = {
        id: notificationId,
        read: true,
        userId: 'user-123',
        type: 'TASK_ASSIGNED',
        title: 'Test notification',
        message: 'Test message',
        created_at: new Date(),
      };

      mockPrisma.notification.update.mockResolvedValue(mockUpdatedNotification);

      const result = await NotificationService.markAsRead(notificationId);

      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: notificationId },
        data: { read: true },
      });

      expect(result).toEqual(mockUpdatedNotification);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      const userId = 'user-123';
      const mockResult = { count: 5 };

      mockPrisma.notification.updateMany.mockResolvedValue(mockResult);

      const result = await NotificationService.markAllAsRead(userId);

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId, read: false },
        data: { read: true },
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      const notificationId = 'notification-123';
      const mockDeletedNotification = {
        id: notificationId,
        userId: 'user-123',
        type: 'TASK_ASSIGNED',
        title: 'Test notification',
        message: 'Test message',
        read: false,
        created_at: new Date(),
      };

      mockPrisma.notification.delete.mockResolvedValue(mockDeletedNotification);

      const result = await NotificationService.delete(notificationId);

      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
        where: { id: notificationId },
      });

      expect(result).toEqual(mockDeletedNotification);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread notification count', async () => {
      const userId = 'user-123';
      mockPrisma.notification.count.mockResolvedValue(3);

      const result = await NotificationService.getUnreadCount(userId);

      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: { userId, read: false },
      });

      expect(result).toBe(3);
    });
  });

  describe('convenience methods', () => {
    it('should create task assigned notification', async () => {
      const mockNotification = {
        id: 'notification-123',
        familyId: 'family-123',
        userId: 'user-123',
        type: 'TASK_ASSIGNED',
        title: 'New task assigned',
        message: 'You have been assigned "Test Task"',
        entityType: 'task',
        entityId: 'task-123',
        read: false,
        created_at: new Date(),
      };

      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationService.createTaskAssignedNotification(
        'family-123',
        'user-123',
        'task-123',
        'Test Task'
      );

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          familyId: 'family-123',
          userId: 'user-123',
          type: 'TASK_ASSIGNED',
          title: 'New task assigned',
          message: 'You have been assigned "Test Task"',
          entityType: 'task',
          entityId: 'task-123',
        },
      });

      expect(result).toEqual(mockNotification);
    });

    it('should create deadline reminder notification', async () => {
      const deadline = new Date('2024-12-25');
      const mockNotification = {
        id: 'notification-123',
        familyId: 'family-123',
        userId: 'user-123',
        type: 'DEADLINE_REMINDER',
        title: 'Task deadline approaching',
        message: 'Task "Test Task" is due soon',
        entityType: 'task',
        entityId: 'task-123',
        read: false,
        created_at: new Date(),
      };

      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await NotificationService.createDeadlineReminderNotification(
        'family-123',
        'user-123',
        'task-123',
        'Test Task',
        deadline
      );

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          familyId: 'family-123',
          userId: 'user-123',
          type: 'DEADLINE_REMINDER',
          title: 'Task deadline approaching',
          message: 'Task "Test Task" is due soon',
          entityType: 'task',
          entityId: 'task-123',
        },
      });

      expect(result).toEqual(mockNotification);
    });
  });
});